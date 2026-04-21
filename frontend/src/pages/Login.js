import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';

const ServiceInfo = ({ setShowInfo }) => (
  <div className="flex flex-col justify-center flex-1 p-8 md:p-12 lg:p-14 bg-white animate-in fade-in slide-in-from-right-8 duration-500">
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
      <h2 className="text-2xl font-extrabold text-gray-900">Portal Services</h2>
      <button onClick={() => setShowInfo(false)} className="text-sm font-bold text-blue-600 hover:text-blue-800 px-4 py-2.5 rounded-xl bg-blue-50 transition-colors">
        Back to Login
      </button>
    </div>
    <div className="space-y-4">
      {['IPAR', 'PNPKI Application', 'CyberSecurity Response', 'ISSP'].map((service) => (
        <div key={service} className="flex items-start gap-5 p-5 border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-2xl transition-all group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{service}</h4>
            <p className="text-sm text-gray-500 mt-1.5">Manage and track your comprehensive progress and requests.</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AuthForm = ({ isLogin, loading, formData, handleChange, handleSubmit, setIsLogin }) => (
  <div className="flex flex-col flex-1 relative animate-in fade-in slide-in-from-right-8 duration-500">
    <div className="w-full max-w-md mx-auto mt-6 md:mt-10 lg:mt-16 mb-24 px-8 md:px-12 space-y-2">
      <div className="text-center space-y-2">
        <div className="w-24 h-24 mx-auto flex items-center justify-center mb-6 bg-blue-50 rounded-full">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Department_of_Transportation_%28Philippines%29.svg/330px-Department_of_Transportation_%28Philippines%29.svg.png" alt="DOTr" className="w-16 h-16 object-contain"/>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{isLogin ? 'Sign In' : 'Create Account'}</h2>
        <p className="text-slate-500 text-base font-medium">Enter your details below to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mt-8">
        {!isLogin && (
          <>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="w-5 h-5 text-gray-400"/></div>
                <input required name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all">
                <option value="User">User</option>
                <option value="Supervisor">Supervisor</option>
                <option value="HRDD">HRDD</option>
                <option value="AuthorizedSignatory">Authorized Signatory</option>
              </select>
            </div>
          </>
        )}
        
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="w-5 h-5 text-gray-400"/></div>
            <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-gray-400"/></div>
            <input type="password" required name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
          </div>
        </div>
        
        <button disabled={loading} type="submit" className="w-full bg-[#0b3d91] hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center mt-6">
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm font-semibold text-[#0b3d91] hover:underline">
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  </div>
);

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'User'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        await register(formData.email, formData.password, formData.name, formData.role);
        toast.success("Account created successfully!");
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-0 md:p-6 lg:p-10 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="h-full w-full max-w-[1400px] flex flex-col md:flex-row bg-white md:rounded-2xl shadow-2xl overflow-hidden relative border border-slate-200/60">
        
        <div className={`hidden md:flex flex-col md:w-1/2 lg:w-3/5 h-full relative overflow-hidden transition-all duration-500 bg-[#0f172a]`}>
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" alt="Building" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"/>
          <div className="absolute inset-0 z-1 bg-gradient-to-t from-[#0b3d91] via-[#0b3d91]/80 to-transparent h-full w-full"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col justify-end p-10 lg:p-16 text-left text-white">
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
              Welcome to the<br/><span className="text-blue-300">HRDD Portal</span>
            </h1>
            <p className="text-white/80 text-lg font-light leading-relaxed max-w-xl mb-8">
              The HRDD portal is a comprehensive centralized hub providing seamless access to the complete catalog of training programs and developmental processes offered by the HRDD Learning and Development unit.
            </p>
            <div>
              <button onClick={() => setShowInfo(!showInfo)} className="group bg-white text-[#0b3d91] hover:bg-gray-50 font-bold py-3.5 px-8 rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 w-max">
                {showInfo ? 'Close Services' : 'Explore Services'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          </div>
        </div>

        {showInfo ? (
          <ServiceInfo setShowInfo={setShowInfo} />
        ) : (
          <AuthForm 
            isLogin={isLogin} 
            loading={loading} 
            formData={formData} 
            handleChange={handleChange} 
            handleSubmit={handleSubmit} 
            setIsLogin={setIsLogin} 
          />
        )}
      </div>
    </div>
  );
}
