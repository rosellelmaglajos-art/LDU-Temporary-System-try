import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { FileText, Plus, Eye, X, Check, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import NominationTemplate from '../components/NominationTemplate';
import JobAnalysisTemplate from '../components/JobAnalysisTemplate';

const getStatusColor = (status) => {
  if (status?.includes('pending')) return 'bg-amber-100 text-amber-800';
  if (status?.includes('approved') || status === 'authorized') return 'bg-emerald-100 text-emerald-800';
  if (status === 'rejected') return 'bg-red-100 text-red-800';
  return 'bg-slate-100 text-slate-800';
};

const FormsTable = ({ forms, loading, filter, onSelectForm }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
          <th className="px-6 py-4">Type</th>
          <th className="px-6 py-4">Applicant</th>
          <th className="px-6 py-4">Date</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading...</td></tr>
        ) : forms.length === 0 ? (
          <tr><td colSpan="5" className="text-center py-8 text-slate-500 font-medium">No forms found.</td></tr>
        ) : (
          forms.filter(f => filter === 'all' || f.status?.includes(filter)).map(form => (
            <tr key={form._id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4 font-bold text-slate-900 capitalize flex items-center gap-3">
                <div className={`p-2 rounded-lg ${form.type === 'nomination' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                  <FileText className="w-5 h-5"/>
                </div>
                {form.type.replace('_', ' ')}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-600">{form.user_name}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{new Date(form.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(form.status)}`}>
                  {form.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onSelectForm(form)} className="p-2 text-slate-400 hover:text-[#0b3d91] hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const FormDetailsModal = ({ form, user, view, onClose, onGeneratePDF, onUpdateStatus }) => {
  if (!form) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 capitalize">{form.type.replace('_', ' ')} Details</h3>
            <p className="text-sm text-slate-500 font-medium">Submitted by {form.user_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onGeneratePDF} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-xl transition-colors">
              <Printer className="w-4 h-4"/> Print PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6"/></button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(form.data).map(([k, v]) => (
              <div key={k} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-slate-900 font-medium whitespace-pre-wrap">{v || 'N/A'}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-extrabold text-slate-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Approval Log</h4>
            <div className="space-y-4">
              {form.logs.map((log) => (
                <div key={log.timestamp + log.action} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4"/>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 capitalize">{log.action.replace('_', ' ')}</p>
                    <p className="text-sm text-slate-500">by {log.by} ({log.role}) &bull; {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {view === 'approvals' && (
          <div className="p-6 border-t border-slate-200 bg-white flex gap-4 justify-end">
            <button onClick={() => onUpdateStatus(form._id, 'rejected')} className="px-6 py-3 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              Reject
            </button>
            <button onClick={() => onUpdateStatus(form._id, user.role === 'Supervisor' ? 'pending_hrdd' : 'approved')} className="px-6 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 rounded-xl transition-colors flex items-center gap-2">
              <Check className="w-5 h-5"/> Approve & Forward
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Forms({ view }) {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('list');
  const [selectedForm, setSelectedForm] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/forms`, { withCredentials: true });
      let data = res.data;
      if (view === 'approvals') {
        data = data.filter(f => f.user_id !== user._id);
        if (user.role === 'Supervisor') {
          data = data.filter(f => f.status === 'pending_supervisor');
        } else if (user.role === 'HRDD') {
          data = data.filter(f => f.status === 'pending_hrdd' || f.status?.includes('approved'));
        }
      } else {
        data = data.filter(f => f.user_id === user._id);
      }
      setForms(data);
    } catch (err) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, [view, user._id, user.role]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleStatusUpdate = async (formId, status) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/forms/${formId}/status`, 
        { status, comment: "Updated via dashboard" },
        { withCredentials: true }
      );
      toast.success(`Form marked as ${status}`);
      fetchForms();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const generatePDF = () => {
    if (!selectedForm) return;
    const isNom = selectedForm.type === 'nomination';
    const element = document.getElementById(isNom ? 'pdf-nomination-container' : 'pdf-ja-container');
    
    // Populate data
    if (isNom) {
       document.getElementById('pdf-title').innerText = selectedForm.data.title || '';
       document.getElementById('pdf-name').innerText = selectedForm.data.name || '';
       document.getElementById('pdf-position').innerText = selectedForm.data.position || '';
       document.getElementById('pdf-email').innerText = selectedForm.data.email || '';
    } else {
       document.getElementById('pdf-ja-fullname').innerText = selectedForm.data.name || '';
       document.getElementById('pdf-ja-position').innerText = selectedForm.data.position || '';
       document.getElementById('pdf-ja-purpose').innerText = selectedForm.data.purpose || '';
    }

    const opt = {
      margin: 0,
      filename: `${selectedForm.type}_${selectedForm.user_name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {view === 'my' ? 'My Submissions' : 'Pending Approvals'}
        </h1>
        
        {view === 'my' && (
          <div className="flex gap-3">
            <button onClick={() => { setModalType('create_nomination'); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#0b3d91] text-white rounded-xl font-bold shadow-md hover:bg-blue-800 transition-colors">
              <Plus className="w-5 h-5"/> Nomination
            </button>
            <button onClick={() => { setModalType('create_ja'); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-700 transition-colors">
              <Plus className="w-5 h-5"/> Job Analysis
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f}
            </button>
          ))}
        </div>
        
        <FormsTable 
          forms={forms} 
          loading={loading} 
          filter={filter} 
          onSelectForm={(form) => { setSelectedForm(form); setModalType('view'); setShowModal(true); }} 
        />
      </div>

      {showModal && modalType === 'view' && selectedForm && (
        <FormDetailsModal 
          form={selectedForm} 
          user={user} 
          view={view} 
          onClose={() => setShowModal(false)} 
          onGeneratePDF={generatePDF} 
          onUpdateStatus={handleStatusUpdate} 
        />
      )}

      {/* Hidden Templates for PDF Generation */}
      <div className="hidden">
        <NominationTemplate id="pdf-nomination-container" />
        <JobAnalysisTemplate id="pdf-ja-container" />
      </div>

      {showModal && (modalType === 'create_nomination' || modalType === 'create_ja') && (
        <CreateFormModal 
          type={modalType === 'create_nomination' ? 'nomination' : 'job_analysis'} 
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchForms(); }}
        />
      )}
    </div>
  );
}

function CreateFormModal({ type, onClose, onSuccess }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/forms`, 
        { type, data },
        { withCredentials: true }
      );
      toast.success('Form submitted successfully!');
      onSuccess();
    } catch (err) {
      toast.error('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-extrabold text-slate-900 capitalize">New {type.replace('_', ' ')}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form id="createForm" onSubmit={handleSubmit} className="space-y-5">
            {type === 'nomination' ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Training Title</label>
                  <input required onChange={e => setData({...data, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nominee Name</label>
                    <input required onChange={e => setData({...data, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Position</label>
                    <input required onChange={e => setData({...data, position: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                  <input required type="email" onChange={e => setData({...data, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"/>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                    <input required onChange={e => setData({...data, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Position Title</label>
                    <input required onChange={e => setData({...data, position: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Job Purpose</label>
                  <textarea required rows="4" onChange={e => setData({...data, purpose: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"></textarea>
                </div>
              </>
            )}
          </form>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
          <button form="createForm" disabled={loading} type="submit" className="px-6 py-3 font-bold text-white bg-[#0b3d91] hover:bg-blue-800 shadow-lg rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </div>
    </div>
  );
}
