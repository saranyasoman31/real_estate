import React, { useState, useEffect } from 'react';
import { enquiryService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showToast, showAlertSuccess, showAlertError } from '../../utils/alerts';
import {
  FileText,
  Phone,
  MessageCircle,
  Clock,
  Search,
  Save,
  Building,
  CheckCircle,
  ExternalLink,
  Send,
  Mail,
  X,
  History,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientInquiries = () => {
  const { agency, user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [notesState, setNotesState] = useState({});

  // Email Push Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [pushingEmail, setPushingEmail] = useState(false);

  // Email History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await enquiryService.getClientEnquiries({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined
      });
      if (res.success) {
        setEnquiries(res.data);
        const notesObj = {};
        res.data.forEach(e => { notesObj[e.id] = e.agent_notes || ''; });
        setNotesState(notesObj);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      showAlertError('Error', err.message);
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
        showToast(`Lead stage updated to "${newStatus}"!`, 'success');
      }
    } catch (err) {
      showAlertError('Failed to update stage', err.message);
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
        showToast('Private lead note saved!', 'success');
      }
    } catch (err) {
      showAlertError('Failed to save note', err.message);
    } finally {
      setSavingNoteId(null);
    }
  };

  // Open Email Push Modal with prefilled defaults
  const handleOpenEmailModal = (enq) => {
    setActiveEnquiry(enq);
    const agentName = agency?.name || user?.name || 'Saranya Soman';
    setEmailSubject(`Regarding your property enquiry for "${enq.property_title}" - Apex Realty`);
    setEmailMessage(
      `Hello ${enq.customer_name},\n\nThank you for reaching out regarding "${enq.property_title}" (Ref: ${enq.ref_number || 'TVM-LST'}).\n\nI am the property advisor representing this listing in Trivandrum. I would be pleased to answer your queries or coordinate a personalized site visit for you.\n\nPlease feel free to reply directly to this email or reach me directly on call/WhatsApp at ${agency?.phone || '+91 98470 12345'}.\n\nWarm regards,\n${agentName}\nApex Realty & Advisory`
    );
    setEmailModalOpen(true);
  };

  // Select Quick Template
  const handleTemplateSelect = (type) => {
    if (!activeEnquiry) return;
    const agentName = agency?.name || user?.name || 'Saranya Soman';
    const phone = agency?.phone || '+91 98470 12345';

    if (type === 'site_visit') {
      setEmailSubject(`Site Visit Invitation: "${activeEnquiry.property_title}" - Apex Realty`);
      setEmailMessage(
        `Dear ${activeEnquiry.customer_name},\n\nWe have scheduled site visits this week for "${activeEnquiry.property_title}".\n\n${activeEnquiry.preferred_time ? `You mentioned preferred timing: ${activeEnquiry.preferred_time}.\n\n` : ''}Would you be available for a walkthrough this Saturday or Sunday morning? Please confirm your convenient time slot.\n\nBest regards,\n${agentName}\nDirect Phone: ${phone}`
      );
    } else if (type === 'brochure') {
      setEmailSubject(`Property Details & Pricing Breakdown: "${activeEnquiry.property_title}"`);
      setEmailMessage(
        `Hello ${activeEnquiry.customer_name},\n\nAs requested, here are additional details for "${activeEnquiry.property_title}" in ${activeEnquiry.city}.\n\nPrice: ${activeEnquiry.price ? '₹ ' + Number(activeEnquiry.price).toLocaleString('en-IN') : 'Available on request'}\nLocation: ${activeEnquiry.city}, Kerala\nReference: ${activeEnquiry.ref_number}\n\nLet me know if you would like me to send the complete floor plans and RERA title documents.\n\nWarm regards,\n${agentName}\nApex Realty`
      );
    } else if (type === 'callback') {
      setEmailSubject(`Connecting regarding your request: "${activeEnquiry.property_title}"`);
      setEmailMessage(
        `Dear ${activeEnquiry.customer_name},\n\nI tried reaching you on your phone number (${activeEnquiry.customer_phone}) regarding your inquiry on "${activeEnquiry.property_title}".\n\nPlease let me know a convenient time to speak, or drop a message on WhatsApp at ${phone}.\n\nLooking forward to assisting you.\n\nBest regards,\n${agentName}`
      );
    }
  };

  // Push Email to Customer
  const handleSendEmailPush = async (e) => {
    e.preventDefault();
    if (!emailMessage.trim()) {
      showAlertError('Missing Content', 'Please enter a message before sending.');
      return;
    }

    try {
      setPushingEmail(true);
      const res = await enquiryService.pushEmail(activeEnquiry.id, {
        subject: emailSubject,
        message: emailMessage
      });

      if (res.success) {
        setEmailModalOpen(false);
        setEnquiries(prev =>
          prev.map(enq =>
            enq.id === activeEnquiry.id
              ? {
                  ...enq,
                  status: enq.status === 'new' ? 'contacted' : enq.status,
                  last_email_push_at: new Date().toISOString(),
                  email_push_count: (enq.email_push_count || 0) + 1
                }
              : enq
          )
        );
        showAlertSuccess(
          'Email Pushed Successfully!',
          `Direct follow-up email has been delivered to ${activeEnquiry.customer_name} (${activeEnquiry.customer_email}).`
        );
      }
    } catch (err) {
      showAlertError('Failed to Push Email', err.message);
    } finally {
      setPushingEmail(false);
    }
  };

  // View Past Email Push History
  const handleViewEmailHistory = async (enq) => {
    try {
      setActiveEnquiry(enq);
      setLoadingHistory(true);
      setHistoryModalOpen(true);
      const res = await enquiryService.getEmailHistory(enq.id);
      if (res.success) {
        setEmailHistory(res.data);
      }
    } catch (err) {
      showAlertError('Could not load history', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Customer Messages & Requests
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email Push Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              View customer inquiries, site visit requests, and push direct follow-up emails, WhatsApp chats, or phone calls.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Inquiry Destination:</span>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 justify-end mt-0.5">
              <Mail className="w-3.5 h-3.5 text-brand-600" />
              <span>{agency?.email || user?.email || 'saranyasoman31@gmail.com'}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'new', label: 'New Inquiries' },
              { id: 'contacted', label: 'Contacted' },
              { id: 'follow_up', label: 'Follow Up Scheduled' },
              { id: 'closed', label: 'Deal Finalized' },
              { id: 'not_interested', label: 'Closed' }
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

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search customer, phone, property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEnquiries()}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Inquiries List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-44 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No customer inquiries found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When customers submit the inquiry form or request site visits on your properties in Trivandrum, they will appear here with instant email push and WhatsApp options.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => {
              let cleanPhone = (enq.customer_phone || '').replace(/[^0-9]/g, '');
              if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
              const waText = encodeURIComponent(
                `Hello ${enq.customer_name}, thank you for your interest in "${enq.property_title}". I am the property owner/advisor. How can I assist you?`
              );
              const hasPushedEmail = Boolean(enq.last_email_push_at);

              return (
                <div
                  key={enq.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-base shadow-xs">
                        {enq.customer_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{enq.customer_name}</h4>
                          {enq.enquiry_type === 'site_visit' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Site Visit Request
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">{enq.customer_phone}</span>
                          <span>•</span>
                          <span className="text-brand-600">{enq.customer_email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Dropdown */}
                      <div className="flex items-center gap-1.5 mr-2">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Stage:</span>
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
                          <option value="closed">Deal Finalized</option>
                          <option value="not_interested">Not Interested</option>
                        </select>
                      </div>

                      {/* EMAIL PUSH BUTTON */}
                      <button
                        onClick={() => handleOpenEmailModal(enq)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                        title="Push direct email response to customer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Email Push</span>
                      </button>

                      {/* WhatsApp Button */}
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${waText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Call Button */}
                      <a
                        href={`tel:${enq.customer_phone}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>

                  {/* Property & Requirement context */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inquired Property</span>
                      <p className="font-bold text-slate-800 text-sm">{enq.property_title}</p>
                      <p className="text-slate-500">Ref: {enq.ref_number} • City: {enq.city || 'Trivandrum'}</p>
                      {enq.preferred_time && (
                        <p className="text-slate-700 font-semibold flex items-center gap-1 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          <span>Preferred Walkthrough: {enq.preferred_time}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Message</span>
                      <p className="text-slate-700 italic text-xs leading-relaxed">"{enq.message}"</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400">
                          Received: {new Date(enq.created_at).toLocaleString()}
                        </span>
                        {hasPushedEmail && (
                          <button
                            onClick={() => handleViewEmailHistory(enq)}
                            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <History className="w-3 h-3" />
                            <span>Pushed {enq.email_push_count || 1}x</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Internal CRM Notes */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add private note (e.g. Budget ₹1.5 Cr, requested Kowdiar flat visit on Sunday)..."
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

      {/* EMAIL PUSH MODAL */}
      {emailModalOpen && activeEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Push Email to Customer</h3>
                  <p className="text-xs text-indigo-200">
                    To: {activeEnquiry.customer_name} ({activeEnquiry.customer_email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmailPush} className="p-6 space-y-4">
              {/* Quick Template Chips */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Quick Response Templates:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('site_visit')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                  >
                    📅 Schedule Site Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('brochure')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                  >
                    📄 Share Brochure & Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('callback')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
                  >
                    📞 Call Request Follow-Up
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows="7"
                  required
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-[11px]"
                ></textarea>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Sender / Reply-To: <strong>{agency?.email || 'saranyasoman31@gmail.com'}</strong></span>
                <span>Direct Contact: <strong>{agency?.phone || '+91 98470 12345'}</strong></span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pushingEmail}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/25 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{pushingEmail ? 'Pushing Email...' : 'Push Email Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL HISTORY MODAL */}
      {historyModalOpen && activeEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Email Push History</h3>
                <p className="text-xs text-slate-500">Sent to {activeEnquiry.customer_name} ({activeEnquiry.customer_email})</p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-96 overflow-y-auto divide-y divide-slate-100">
              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
              ) : emailHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No emails pushed yet.</div>
              ) : (
                emailHistory.map((item) => (
                  <div key={item.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.subject}</span>
                      <span className="text-[10px] text-slate-400">{new Date(item.sent_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientInquiries;
