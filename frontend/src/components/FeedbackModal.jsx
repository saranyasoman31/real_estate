import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { feedbackService } from '../services/api';
import { showAlertSuccess, showAlertError } from '../utils/alerts';
import {
  Star,
  X,
  MessageSquare,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'Overall Experience',
  'Property Purchase',
  'Rental Services',
  'Trust & Transparency',
  'Agent Responsiveness',
  'Documentation & Legal Clearances'
];

const FeedbackModal = ({ isOpen, onClose, propertyId = null, propertyTitle = null, onSuccess }) => {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('Overall Experience');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      showAlertError('Rating Required', 'Please choose a star rating (1 to 5 stars).');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      showAlertError('Contact Required', 'Please enter your name and email address.');
      return;
    }

    if (!comment.trim()) {
      showAlertError('Comment Required', 'Please share your feedback or review experience.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await feedbackService.submitFeedback({
        rating,
        category,
        feedback_title: title.trim() || undefined,
        comment: comment.trim(),
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim() || undefined,
        property_id: propertyId || undefined
      });

      if (res.success) {
        await showAlertSuccess(
          'Feedback Submitted!',
          'Thank you for rating your experience. Your feedback directly impacts our Customer Trust Score!'
        );
        onClose();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      showAlertError('Submission Failed', err.response?.data?.message || err.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (val) => {
    switch (val) {
      case 5: return '⭐⭐⭐⭐⭐ Exceptional / 100% Recommended';
      case 4: return '⭐⭐⭐⭐ Very Good / Highly Satisfied';
      case 3: return '⭐⭐⭐ Satisfactory Experience';
      case 2: return '⭐⭐ Needs Improvement';
      case 1: return '⭐ Poor Experience';
      default: return 'Select your rating';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-400/30">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
              Customer Trust & Feedback
            </span>
          </div>

          <h3 className="text-xl font-black text-white">Rate Your Experience</h3>
          <p className="text-xs text-slate-300 mt-1">
            Your honest feedback updates the verified Customer Trust Score for DARV Real Estate & Construction.
          </p>

          {propertyTitle && (
            <div className="mt-3 p-2.5 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-300 shrink-0" />
              <span className="truncate font-semibold">{propertyTitle}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Star Rating Interactive Selector */}
          <div className="text-center p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <label className="block text-xs font-bold text-amber-950 mb-2">
              How would you rate your experience? *
            </label>
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition transform focus:outline-none"
                    title={`${star} Star`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        filled ? 'fill-amber-400 text-amber-400 drop-shadow' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-amber-800 mt-1.5 transition">
              {getRatingLabel(hoverRating || rating)}
            </p>
          </div>

          {/* Feedback Category Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Feedback Focus / Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    category === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Headline / Summary</label>
            <input
              type="text"
              placeholder="e.g. Great transparency & smooth paperwork in Kowdiar villa purchase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Comment / Review */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback & Review *</label>
            <textarea
              rows={3}
              required
              placeholder="Tell others about agent responsiveness, property verification, site visits, or overall advisory..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* User Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Nair"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default FeedbackModal;
