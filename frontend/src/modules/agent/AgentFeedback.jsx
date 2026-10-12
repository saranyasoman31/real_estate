import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { feedbackService } from '../../services/api';
import { showAlertSuccess, showAlertError, showConfirmDialog, showToast } from '../../utils/alerts';
import {
  ShieldCheck,
  Star,
  Search,
  MessageSquare,
  Sparkles,
  Trash2,
  Reply,
  Building2,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Send,
  X,
  ExternalLink,
  Award
} from 'lucide-react';

const AgentFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [metrics, setMetrics] = useState({
    trustScore: 100,
    averageRating: 5.0,
    totalReviews: 0,
    positivePercentage: 100,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    isBaseline: true
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [ratingFilter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getAgentFeedback({
        rating: ratingFilter === 'all' ? undefined : ratingFilter,
        search: search.trim() || undefined
      });
      if (res.success) {
        setFeedbacks(res.data);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load agent feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeedbacks();
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await feedbackService.toggleFeatured(id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchFeedbacks();
      }
    } catch (err) {
      showAlertError('Failed', err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Customer Review?',
      text: 'This will remove the feedback and recalculate your Customer Trust Score.',
      confirmButtonText: 'Yes, Delete Review'
    });
    if (!confirmed) return;

    try {
      const res = await feedbackService.deleteFeedback(id);
      if (res.success) {
        showAlertSuccess('Review Removed', 'Customer feedback has been deleted.');
        fetchFeedbacks();
      }
    } catch (err) {
      showAlertError('Delete Failed', err.message);
    }
  };

  const handleSendReply = async (id) => {
    if (!replyText.trim()) {
      showToast('Please type your response', 'warning');
      return;
    }
    try {
      setSubmittingReply(true);
      const res = await feedbackService.replyToFeedback(id, replyText);
      if (res.success) {
        showToast('Agent reply published successfully!', 'success');
        setActiveReplyId(null);
        setReplyText('');
        fetchFeedbacks();
      }
    } catch (err) {
      showAlertError('Reply Failed', err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderStars = (count) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s <= count ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Customer Feedback & Trust Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                Live Reputation
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review customer ratings, respond to buyer/tenant reviews, and track your verified Customer Trust Score.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition self-start md:self-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* TRUST SCORE OVERVIEW CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Main Trust Score Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-black/20 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-brand-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified Customer Trust Score
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-500/30">
                  {metrics.trustScore >= 90 ? 'Grade A+ Excellence' : 'Active Credibility'}
                </span>
              </div>

              <div className="flex items-baseline gap-4 my-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {metrics.trustScore}%
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm sm:text-base">
                    <span>{metrics.averageRating}</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-400 font-normal">/ 5.0 Star Rating</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Based on {metrics.totalReviews} verified customer reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{metrics.positivePercentage}% Positive Recommendations</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {metrics.isBaseline ? 'Baseline Verified Score' : 'Updated Live from Feedback'}
              </span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Rating Distribution
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = metrics.breakdown[star] || 0;
                  const pct = metrics.totalReviews > 0 ? Math.round((count / metrics.totalReviews) * 100) : (star === 5 ? 100 : 0);
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                        {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-brand-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold text-slate-500 text-[11px]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Public Badge: Verified Advisory</span>
              <span className="font-bold text-slate-800">100% Genuine Reviews</span>
            </div>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: '5', label: '5 Stars ★' },
              { id: '4', label: '4 Stars ★' },
              { id: '3', label: '3 Stars ★' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRatingFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  ratingFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search feedback or reviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </form>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-36 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
              <Star className="w-7 h-7 fill-current" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Customer Reviews Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Customer ratings and reviews submitted from your property listings and marketplace will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Top Row: Reviewer, Rating & Category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm">
                      {fb.customer_name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{fb.customer_name}</h4>
                        {fb.is_featured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600 fill-current" /> Featured Testimonial
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {fb.customer_email}
                        </span>
                        {fb.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {fb.customer_phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(fb.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5">
                      {renderStars(fb.rating)}
                      <span className="text-xs font-bold text-amber-800 ml-1">{fb.rating}.0</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                      {fb.category || 'General Feedback'}
                    </span>
                  </div>
                </div>

                {/* Review Title & Comment */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  {fb.feedback_title && (
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900">{fb.feedback_title}</h5>
                  )}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{fb.comment}</p>

                  {fb.property_title && (
                    <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>Property: <strong>{fb.property_title}</strong></span>
                      {fb.property_ref && <span className="text-[10px] text-brand-600 font-bold">({fb.property_ref})</span>}
                    </div>
                  )}
                </div>

                {/* Agent Reply Display */}
                {fb.agent_reply && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 space-y-1 ml-4 sm:ml-8">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                      <span className="flex items-center gap-1">
                        <Reply className="w-3.5 h-3.5 rotate-180" /> Official Agent Response
                      </span>
                      {fb.agent_replied_at && (
                        <span className="text-emerald-600 font-normal">
                          {new Date(fb.agent_replied_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">{fb.agent_reply}</p>
                  </div>
                )}

                {/* Reply Form Box if Active */}
                {activeReplyId === fb.id && (
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 space-y-2 ml-4 sm:ml-8 animate-in fade-in duration-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Post Official Reply to {fb.customer_name}:</span>
                      <button
                        onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Thank the customer or address their note..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(fb.id)}
                        disabled={submittingReply}
                        className="px-4 py-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>{submittingReply ? 'Posting...' : 'Publish Reply'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveReplyId(activeReplyId === fb.id ? null : fb.id);
                        setReplyText(fb.agent_reply || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold flex items-center gap-1.5 transition"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{fb.agent_reply ? 'Edit Response' : 'Reply to Customer'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleFeatured(fb.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 transition ${
                        fb.is_featured
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{fb.is_featured ? 'Pinned on Site' : 'Pin as Testimonial'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(fb.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AgentFeedback;
