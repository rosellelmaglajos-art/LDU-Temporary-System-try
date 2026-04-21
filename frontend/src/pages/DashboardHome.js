import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/stats`, { withCredentials: true });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-slate-500 mt-2 font-medium">Here's what's happening with your forms today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
              <c.icon className={`w-6 h-6 ${c.color}`} />
            </div>
            <p className="text-4xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{c.title}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-blue-900 to-[#0b3d91] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 md:w-2/3">
          <h2 className="text-2xl font-bold mb-3">Need to submit a new request?</h2>
          <p className="text-blue-100 mb-6 font-medium leading-relaxed">Fill out a new Nomination or Job Analysis form. All forms are automatically routed to your supervisor for initial approval.</p>
          <div className="flex gap-4">
             <span className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold">Go to Forms Tab &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
}
