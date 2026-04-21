import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.environ.get("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "*" # allowing all for testing, since we might hit from preview urls
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB Setup ---
client = AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
db = client[os.environ.get("DB_NAME", "emergent_db")]

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "super_secret_key_123")

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, 
        "email": email, 
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1), 
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id, 
        "exp": datetime.now(timezone.utc) + timedelta(days=7), 
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Schemas ---
class RegisterModel(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "User" # Default role

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class FormSubmitModel(BaseModel):
    type: str # 'nomination' or 'job_analysis'
    data: Dict[str, Any]

class FormUpdateStatusModel(BaseModel):
    status: str
    comment: Optional[str] = None

# --- Admin Seeding ---
@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    
    # Seed HRDD Admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "HRDD Admin",
            "role": "HRDD",
            "created_at": datetime.now(timezone.utc)
        })
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email}, 
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
    
    # Seed Supervisor
    supervisor_email = "supervisor@example.com"
    existing_sup = await db.users.find_one({"email": supervisor_email})
    if not existing_sup:
        await db.users.insert_one({
            "email": supervisor_email,
            "password_hash": hash_password("super123"),
            "name": "Test Supervisor",
            "role": "Supervisor",
            "created_at": datetime.now(timezone.utc)
        })

    # Seed User
    user_email = "user@example.com"
    existing_user = await db.users.find_one({"email": user_email})
    if not existing_user:
        await db.users.insert_one({
            "email": user_email,
            "password_hash": hash_password("user123"),
            "name": "Test User",
            "role": "User",
            "created_at": datetime.now(timezone.utc)
        })

# --- Auth Endpoints ---
@app.post("/api/auth/register")
async def register(data: RegisterModel, response: Response):
    email = data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "email": email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "role": data.role if data.role in ["User", "Supervisor", "HRDD", "AuthorizedSignatory"] else "User",
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email, user_doc["role"])
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"_id": user_id, "email": email, "name": user_doc["name"], "role": user_doc["role"]}

@app.post("/api/auth/login")
async def login(data: LoginModel, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email, user.get("role", "User"))
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {"_id": user_id, "email": email, "name": user.get("name", ""), "role": user.get("role", "User")}

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user


# --- Form Endpoints ---
@app.post("/api/forms")
async def submit_form(data: FormSubmitModel, user: dict = Depends(get_current_user)):
    form_doc = {
        "user_id": user["_id"],
        "user_name": user["name"],
        "type": data.type,
        "data": data.data,
        "status": "pending_supervisor",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "logs": [{
            "action": "submitted",
            "by": user["name"],
            "role": user["role"],
            "timestamp": datetime.now(timezone.utc)
        }]
    }
    result = await db.forms.insert_one(form_doc)
    return {"_id": str(result.inserted_id), "message": "Form submitted successfully"}

@app.get("/api/forms")
async def get_forms(user: dict = Depends(get_current_user)):
    role = user.get("role", "User")
    query = {}
    
    if role == "User":
        query = {"user_id": user["_id"]}
    elif role == "Supervisor":
        # Supervisor sees their own forms AND pending supervisor forms of others
        # Simplified: sees all for now, in a real app would filter by department
        query = {}
    elif role in ["HRDD", "AuthorizedSignatory"]:
        query = {} # See all
        
    cursor = db.forms.find(query).sort("created_at", -1)
    forms = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        forms.append(doc)
    return forms

@app.put("/api/forms/{form_id}/status")
async def update_form_status(form_id: str, data: FormUpdateStatusModel, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["Supervisor", "HRDD", "AuthorizedSignatory"]:
        raise HTTPException(status_code=403, detail="Not authorized to update status")
        
    form = await db.forms.find_one({"_id": ObjectId(form_id)})
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
        
    log_entry = {
        "action": data.status,
        "by": user["name"],
        "role": user["role"],
        "comment": data.comment,
        "timestamp": datetime.now(timezone.utc)
    }
    
    await db.forms.update_one(
        {"_id": ObjectId(form_id)},
        {
            "$set": {
                "status": data.status,
                "updated_at": datetime.now(timezone.utc)
            },
            "$push": {"logs": log_entry}
        }
    )
    
    return {"message": "Status updated successfully"}

# --- Dashboard Stats Endpoint ---
@app.get("/api/stats")
async def get_stats(user: dict = Depends(get_current_user)):
    role = user.get("role", "User")
    
    query_base = {}
    if role == "User":
        query_base = {"user_id": user["_id"]}
        
    total_forms = await db.forms.count_documents(query_base)
    pending = await db.forms.count_documents({**query_base, "status": {"$regex": "pending"}})
    approved = await db.forms.count_documents({**query_base, "status": "approved"})
    rejected = await db.forms.count_documents({**query_base, "status": "rejected"})
    
    return {
        "total": total_forms,
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }
