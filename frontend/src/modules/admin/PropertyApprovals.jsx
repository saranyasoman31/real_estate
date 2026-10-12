import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../../services/api';
import { formatPrice } from '../../components/PropertyCard';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Search,
  Eye,
  Trash2
} from 'lucide-react';

const PropertyApprovals = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalFilter, setApprovalFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPropId, setSelectedPropId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [approvalFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getAdminProperties({
        approval_status: approvalFilter,
        search
      });
      if (res.success) {
        setProperties(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const res = await propertyService.approveProperty(id);
      if (res.success) {
        fetchProperties();
      }
    } catch (err) {
      alert('Error approving property: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await propertyService.rejectProperty(selectedPropId, rejectReason);
      if (res.success) {
        setRejectModalOpen(false);
        setRejectReason('');
        setSelectedPropId(null);
        fetchProperties();
      }
    } catch (err) {
      alert('Error rejecting: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await propertyService.toggleFeatured(id);
      fetchProperties();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 uppercase tracking-wider">
              SRS v1.0 Section 7.4 & 22
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Property Listing Moderation & Approvals
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify listing accuracy, review photos, approve for public release, or request agent revisions.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'pending', label: 'Pending Review' },
              { id: 'approved', label: 'Approved & Live' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All Listings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setApprovalFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  approvalFilter === tab.id
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
              placeholder="Search ref or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProperties()}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Listings Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-28 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No properties in this status</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={prop.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                    alt=""
                    className="w-24 h-20 rounded-2xl object-cover shrink-0 shadow-xs"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {prop.ref_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        prop.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        prop.approval_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prop.approval_status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {prop.property_type_name} • {prop.city}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">{prop.title}</h4>
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-900 font-extrabold">{formatPrice(prop.price, prop.price_unit, prop.listing_type)}</strong>
                      <span className="mx-2">•</span>
                      Agent: <strong>{prop.agent_name}</strong> ({prop.agency_name})
                    </p>

                    {prop.rejection_reason && (
                      <p className="text-[11px] text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-200">
                        <strong>Previous Rejection:</strong> {prop.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                  
                  {/* Approve */}
                  {prop.approval_status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(prop.id)}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {/* Reject */}
                  {prop.approval_status !== 'rejected' && (
                    <button
                      onClick={() => {
                        setSelectedPropId(prop.id);
                        setRejectModalOpen(true);
                      }}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Toggle Featured */}
                  <button
                    onClick={() => handleToggleFeatured(prop.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                      prop.is_featured
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${prop.is_featured ? 'fill-current text-amber-500' : ''}`} />
                    <span>{prop.is_featured ? 'Featured' : 'Feature'}</span>
                  </button>

                  {/* Preview */}
                  <Link
                    to={`/properties/${prop.id}`}
                    target="_blank"
                    className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition"
                    title="View details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900">Provide Rejection Feedback</h4>
            <textarea
              rows="3"
              required
              placeholder="State what needs correction before this listing can be approved..."
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
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
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

export default PropertyApprovals;
