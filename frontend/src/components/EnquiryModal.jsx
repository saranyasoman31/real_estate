import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { enquiryService } from '../services/api';
import { showAlertSuccess, showAlertError } from '../utils/alerts';
import {
  X,
  Send,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  Building,
  User,
  Clock
} from 'lucide-react';

const EnquiryModal = ({ property, isOpen, onClose }) => {
  const { user, agency } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    preferred_time: '',
    enquiry_type: 'enquiry',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name || !formData.customer_phone || !formData.customer_email) {
      showAlertError('Missing Details', 'Please enter your name, phone number, and email.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await enquiryService.submitEnquiry({
        property_id: property.id,
        ...formData
      });
      if (res.success) {
        setSubmitted(true);
        showAlertSuccess('Inquiry Sent!', 'Your request has been routed directly to our property advisor.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit enquiry.';
      setError(errMsg);
      showAlertError('Submission Failed', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const agentPhone = property.agent_phone || agency?.phone || '+91 98470 12345';
  const agentWhatsapp = property.agent_whatsapp || agency?.whatsapp || agency?.phone || '+91 98470 12345';
  const whatsappText = encodeURIComponent(
    `Hello ${property.agent_name || agency?.name || 'Agent'}, I found your property "${property.title}" (Ref: ${property.ref_number || 'TVM-LST'}) on RealEstate Marketplace. I would like to schedule a discussion.`
  );
  let cleanPhone = agentWhatsapp.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Contact Listing Agent</h3>
              <p className="text-xs text-slate-300 truncate max-w-xs">{property.title}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Enquiry Sent Successfully!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your request has been routed to <strong>{property.agent_name || property.agency_name}</strong>.
                They will call or message you back shortly.
              </p>

              {/* Direct Instant Channels */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${cleanPhone}?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open WhatsApp Chat
                </a>
                <a
                  href={`tel:${agentPhone.replace(/[^0-9]/g, '')}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call {agentPhone}
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {error}
                </div>
              )}

              {/* Enquiry Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Action Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'enquiry', label: 'Send Enquiry' },
                    { id: 'site_visit', label: 'Book Site Visit' },
                    { id: 'callback', label: 'Request Call' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, enquiry_type: t.id })}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition ${
                        formData.enquiry_type === t.id
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact info inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Contact / Visit Time</label>
                <select
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
                >
                  <option value="">Select preferred time (optional)</option>
                  <option value="Anytime during business hours">Anytime during business hours</option>
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                  <option value="Weekend (10:00 AM - 1:00 PM)">Weekend (10:00 AM - 1:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Requirements</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Write your questions or requirements regarding this property..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Send to Agent'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default EnquiryModal;
