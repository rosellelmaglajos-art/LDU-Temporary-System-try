import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, ClipboardCheck, LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import DashboardHome from './DashboardHome';
import Forms from './Forms';

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getLinks = useCallback(() => {
    const links = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'My Forms & Nominations', path: '/dashboard/forms', icon: FileText },
    ];

    if (user?.role !== 'User') {
      links.push({ name: 'Approvals & Requests', path: '/dashboard/approvals', icon: ClipboardCheck });
    }
    return links;
  }, [user?.role]);

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}/>
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Department_of_Transportation_%28Philippines%29.svg/330px-Department_of_Transportation_%28Philippines%29.svg.png" className="w-8 h-8 mr-3" alt="Logo"/>
          <span className="text-xl font-extrabold tracking-tight text-[#0b3d91]">DOTr-HRDD</span>
          <button className="ml-auto lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-2">Menu</p>
          {getLinks().map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            )
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.name?.charAt(0) || <UserIcon />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 font-medium">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location, setSidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
              {location.pathname.includes('forms') ? 'Forms & Nominations' : 
               location.pathname.includes('approvals') ? 'Approvals & Requests' : 'Dashboard Overview'}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/forms" element={<Forms view="my" />} />
              <Route path="/approvals" element={<Forms view="approvals" />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
