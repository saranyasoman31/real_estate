import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, propertyService } from '../../services/api';
import { formatPrice } from '../../components/PropertyCard';
import {
  ShieldCheck,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  FileText,
  Check,
  X,
  ExternalLink,
  MapPin,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPropId, setRejectPropId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (id) => {
    try {
      setActionLoading(true);
      const res = await propertyService.approveProperty(id);
      if (res.success) {
        loadDashboard();
      }
    } catch (err) {
      alert('Error approving property: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProperty = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason for the agent.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await propertyService.rejectProperty(rejectPropId, rejectReason);
      if (res.success) {
        setRejectModalOpen(false);
        setRejectReason('');
        setRejectPropId(null);
        loadDashboard();
      }
    } catch (err) {
      alert('Error rejecting property: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await propertyService.toggleFeatured(id);
      loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, charts, pendingReviews, recentActivity } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Super Administrator Console</span>
              <h1 className="text-xl sm:text-2xl font-black">Marketplace Master Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/approvals"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
            >
              All Approvals Queue
            </Link>
            <Link
              to="/admin/agents"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition"
            >
              Agent Verifications
            </Link>
          </div>
        </div>

        {/* Metric Cards (SRS Section 7.1) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Approvals</span>
            <div className="text-2xl font-black text-amber-600 mt-2">{stats?.pending_properties || 0}</div>
            <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">Review required</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Properties</span>
            <div className="text-2xl font-black text-emerald-600 mt-2">{stats?.published_properties || 0}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Live on marketplace</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified Agents</span>
            <div className="text-2xl font-black text-blue-600 mt-2">{stats?.verified_agents || 0}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{stats?.pending_agents || 0} pending KYC</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Customers</span>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_customers || 0}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Registered users</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inquiries / Leads</span>
            <div className="text-2xl font-black text-indigo-600 mt-2">{stats?.total_enquiries || 0}</div>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">{stats?.new_enquiries || 0} new leads</span>
          </div>
        </div>

        {/* Section: Pending Property Approval Queue (SRS Section 7.4 & 22) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">Property Approval Review Queue</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Properties submitted by agents awaiting administrator verification before publishing</p>
            </div>
            <Link to="/admin/approvals" className="text-xs font-bold text-brand-600 hover:underline">
              View All Approvals ({stats?.pending_properties || 0}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(!pendingReviews || pendingReviews.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All submitted property listings have been reviewed and processed!
              </div>
            ) : (
              pendingReviews.map((prop) => (
                <div key={prop.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-4">
                    <img
                      src={prop.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                      alt=""
                      className="w-20 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                          {prop.ref_number}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Submitted by <strong>{prop.agent_name}</strong> ({prop.agency_name})
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">{prop.title}</h4>
                      <p className="text-xs text-slate-500">
                        {formatPrice(prop.price, prop.price_unit, prop.listing_type)} • {prop.city} • {prop.property_type_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveProperty(prop.id)}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectPropId(prop.id);
                        setRejectModalOpen(true);
                      }}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <Link
                      to={`/properties/${prop.id}`}
                      target="_blank"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                      title="Inspect Listing Preview"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Analytics & Distributions (SRS Section 19) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Properties By Type */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Listings Distribution by Category</h3>
            <div className="space-y-3">
              {charts?.byType?.map((t) => (
                <div key={t.slug} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{t.name}</span>
                    <span className="text-slate-500 font-bold">{t.count} listings</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (parseInt(t.count) / Math.max(1, stats?.total_properties || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Properties By City */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Listings by Metro Location</h3>
            <div className="space-y-3">
              {charts?.byCity?.map((c) => (
                <div key={c.city} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{c.city}</span>
                    <span className="text-slate-500 font-bold">{c.count} properties</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (parseInt(c.count) / Math.max(1, stats?.total_properties || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900">Reject Property Submission</h4>
            <p className="text-xs text-slate-500">
              Provide constructive feedback to the agent explaining why this listing cannot be published in its current state.
            </p>
            <textarea
              rows="3"
              required
              placeholder="e.g. Please provide authentic exterior photos, correct the square footage discrepancy, or update pricing..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
            ></textarea>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectProperty}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
