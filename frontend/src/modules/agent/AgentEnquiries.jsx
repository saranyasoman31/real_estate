import React, { useState, useEffect } from 'react';
import { enquiryService } from '../../services/api';
import {
  FileText,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Save,
  User,
  Building
} from 'lucide-react';

const AgentEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [notesState, setNotesState] = useState({});

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await enquiryService.getAgentEnquiries({ status: statusFilter, search });
      if (res.success) {
        setEnquiries(res.data);
        const notesObj = {};
        res.data.forEach(e => { notesObj[e.id] = e.agent_notes || ''; });
        setNotesState(notesObj);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await enquiryService.updateEnquiryStatus(enquiryId, {
        status: newStatus,
        agent_notes: notesState[enquiryId]
      });
      if (res.success) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: newStatus } : e));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleSaveNotes = async (enquiryId) => {
    try {
      setSavingNoteId(enquiryId);
      const res = await enquiryService.updateEnquiryStatus(enquiryId, {
        agent_notes: notesState[enquiryId]
      });
      if (res.success) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, agent_notes: notesState[enquiryId] } : e));
      }
    } catch (err) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setSavingNoteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wider">
            SRS v1.0 Section 6.5
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Customer Leads & CRM Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries, update lead lifecycle stages, log private notes, and contact prospects via WhatsApp.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Leads' },
              { id: 'new', label: 'New' },
              { id: 'contacted', label: 'Contacted' },
              { id: 'follow_up', label: 'Follow Up' },
              { id: 'closed', label: 'Closed / Deal Won' },
              { id: 'not_interested', label: 'Not Interested' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enquiries List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-36 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No inquiries found</h3>
            <p className="text-xs text-slate-500 mt-1">Incoming customer leads will appear here in real time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => {
              const cleanPhone = (enq.customer_phone || '').replace(/[^0-9]/g, '');
              const waText = encodeURIComponent(
                `Hello ${enq.customer_name}, thank you for your interest in "${enq.property_title}". I am your dedicated listing agent. How can I assist you?`
              );
              return (
                <div
                  key={enq.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">
                        {enq.customer_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{enq.customer_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{enq.customer_phone}</span>
                          <span>•</span>
                          <span>{enq.customer_email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-medium">Stage:</span>
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                            enq.status === 'new' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                            enq.status === 'contacted' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            enq.status === 'follow_up' ? 'bg-purple-50 border-purple-200 text-purple-800' :
                            enq.status === 'closed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="follow_up">Follow Up Scheduled</option>
                          <option value="closed">Deal Closed / Won</option>
                          <option value="not_interested">Not Interested</option>
                        </select>
                      </div>

                      {/* Instant Action buttons */}
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${waText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${enq.customer_phone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Property & Requirement context */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquired Property</span>
                      <p className="font-bold text-slate-800">{enq.property_title}</p>
                      <p className="text-slate-500">Ref: {enq.ref_number} • City: {enq.city}</p>
                      <p className="text-slate-600">Preferred Visit Time: <strong>{enq.preferred_time || 'Flexible'}</strong></p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Inquiry Message</span>
                      <p className="text-slate-700 italic">"{enq.message}"</p>
                      <p className="text-[10px] text-slate-400 mt-1">Received {new Date(enq.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Internal Agent CRM Notes */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add private lead note (e.g. Budget ₹1.2 Cr, wife wants north facing terrace, follow up Friday)..."
                      value={notesState[enq.id] || ''}
                      onChange={(e) => setNotesState({ ...notesState, [enq.id]: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      onClick={() => handleSaveNotes(enq.id)}
                      disabled={savingNoteId === enq.id}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingNoteId === enq.id ? 'Saving...' : 'Save Note'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default AgentEnquiries;
