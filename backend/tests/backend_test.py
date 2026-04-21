import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://nomination-form-gen.preview.emergentagent.com').rstrip('/')

CREDS = {
    "hrdd": ("admin@example.com", "admin123"),
    "supervisor": ("supervisor@example.com", "super123"),
    "user": ("user@example.com", "user123"),
}

def _login(email, password):
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=20)
    return s, r


@pytest.mark.parametrize("role", list(CREDS.keys()))
def test_login_seeded_roles(role):
    email, pwd = CREDS[role]
    s, r = _login(email, pwd)
    assert r.status_code == 200, f"login failed for {role}: {r.status_code} {r.text}"
    data = r.json()
    assert data["email"] == email
    assert "role" in data
    # httpOnly cookie check
    assert "access_token" in s.cookies, "access_token cookie not set"


def test_login_invalid():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_me_and_logout():
    s, r = _login(*CREDS["user"])
    me = s.get(f"{BASE_URL}/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == CREDS["user"][0]
    lo = s.post(f"{BASE_URL}/api/auth/logout")
    assert lo.status_code == 200


def test_register_duplicate():
    r = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": "admin@example.com", "password": "x", "name": "x", "role": "User"
    })
    assert r.status_code == 400


def test_form_submit_get_and_status_flow():
    # User creates nomination
    us, _ = _login(*CREDS["user"])
    payload = {"type": "nomination", "data": {"title": "TEST_Training", "name": "TEST_User", "position": "Dev", "email": "t@t.com"}}
    r = us.post(f"{BASE_URL}/api/forms", json=payload)
    assert r.status_code == 200, r.text
    fid = r.json()["_id"]

    # User sees own form
    r2 = us.get(f"{BASE_URL}/api/forms")
    assert r2.status_code == 200
    assert any(f["_id"] == fid for f in r2.json())

    # Supervisor approves -> pending_hrdd
    ss, _ = _login(*CREDS["supervisor"])
    r3 = ss.put(f"{BASE_URL}/api/forms/{fid}/status", json={"status": "pending_hrdd", "comment": "ok"})
    assert r3.status_code == 200

    # HRDD approves
    hs, _ = _login(*CREDS["hrdd"])
    r4 = hs.put(f"{BASE_URL}/api/forms/{fid}/status", json={"status": "approved", "comment": "ok"})
    assert r4.status_code == 200

    # Verify final status via HRDD list
    r5 = hs.get(f"{BASE_URL}/api/forms")
    form = next((f for f in r5.json() if f["_id"] == fid), None)
    assert form is not None
    assert form["status"] == "approved"
    assert len(form["logs"]) >= 3


def test_unauth_form_access():
    r = requests.get(f"{BASE_URL}/api/forms")
    assert r.status_code == 401


def test_user_cannot_update_status():
    us, _ = _login(*CREDS["user"])
    # create a form
    r = us.post(f"{BASE_URL}/api/forms", json={"type": "job_analysis", "data": {"name": "TEST_U", "position": "P", "purpose": "X"}})
    fid = r.json()["_id"]
    r2 = us.put(f"{BASE_URL}/api/forms/{fid}/status", json={"status": "approved"})
    assert r2.status_code == 403


def test_stats_endpoint():
    us, _ = _login(*CREDS["user"])
    r = us.get(f"{BASE_URL}/api/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["total", "pending", "approved", "rejected"]:
        assert k in d
