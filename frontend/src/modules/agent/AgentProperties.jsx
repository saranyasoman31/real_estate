import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/api';
import { formatPrice } from '../../components/PropertyCard';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Search,
  ExternalLink
} from 'lucide-react';

const AgentProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getAgentProperties({ status: statusFilter, search });
      if (res.success) {
        setProperties(res.data);
      }
    } catch (err) {
      console.error('Failed to load agent listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleSubmitForApproval = async (id) => {
    try {
      setActionLoading(true);
      const res = await propertyService.submitForApproval(id);
      if (res.success) {
        setFeedbackMessage('Listing submitted for admin approval!');
        fetchProperties();
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(true);
      const res = await propertyService.changeStatus(id, newStatus);
      if (res.success) {
        setFeedbackMessage(`Property marked as ${newStatus}!`);
        fetchProperties();
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      setActionLoading(true);
      const res = await propertyService.deleteProperty(id);
      if (res.success) {
        setFeedbackMessage('Property removed successfully.');
        fetchProperties();
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (prop) => {
    if (prop.approval_status === 'pending') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Pending Approval
        </span>
      );
    }
    if (prop.approval_status === 'rejected') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Needs Revisions
        </span>
      );
    }
    if (prop.status === 'published') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Live & Published
        </span>
      );
    }
    if (prop.status === 'sold') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
          Marked Sold
        </span>
      );
    }
    if (prop.status === 'rented') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
          Marked Rented
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
        Draft
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">My Property Listings</h1>
            <p className="text-xs text-slate-500 mt-1">Manage, edit, submit for approval and update status of your properties</p>
          </div>
          <Link
            to="/agent/properties/add"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/25 transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Listing</span>
          </Link>
        </div>

        {feedbackMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {feedbackMessage}
          </div>
        )}

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'published', label: 'Live' },
              { id: 'pending', label: 'Under Review' },
              { id: 'draft', label: 'Drafts' },
              { id: 'sold', label: 'Sold' },
              { id: 'rented', label: 'Rented' }
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

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by title or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>
        </div>

        {/* Listings Table / Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-28 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No properties in this category</h3>
            <p className="text-xs text-slate-500 mt-1">Click "Create New Listing" to publish a new property.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left Info with Image */}
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={prop.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                    alt={prop.title}
                    className="w-24 h-20 sm:w-28 sm:h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                        {prop.ref_number}
                      </span>
                      {getStatusBadge(prop)}
                      <span className="text-[11px] text-slate-400">
                        {prop.property_type_name} • {prop.city}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
                      {prop.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <strong className="text-slate-900 font-extrabold text-sm">
                        {formatPrice(prop.price, prop.price_unit, prop.listing_type)}
                      </strong>
                      <span>•</span>
                      <span>{prop.views_count || 0} Views</span>
                      <span>•</span>
                      <span>{prop.enquiry_count || 0} Inquiries</span>
                    </div>

                    {prop.rejection_reason && (
                      <p className="text-[11px] text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-200">
                        <strong>Revision required:</strong> {prop.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                  
                  {/* Submit for review button (if draft or rejected) */}
                  {(prop.status === 'draft' || prop.approval_status === 'rejected') && (
                    <button
                      onClick={() => handleSubmitForApproval(prop.id)}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Review</span>
                    </button>
                  )}

                  {/* Mark Sold or Rented (if published) */}
                  {prop.status === 'published' && (
                    <button
                      onClick={() => handleStatusChange(prop.id, prop.listing_type === 'rent' ? 'rented' : 'sold')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      Mark {prop.listing_type === 'rent' ? 'Rented' : 'Sold'}
                    </button>
                  )}

                  {/* Re-publish (if sold/rented) */}
                  {['sold', 'rented'].includes(prop.status) && (
                    <button
                      onClick={() => handleStatusChange(prop.id, 'published')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                    >
                      Re-list as Active
                    </button>
                  )}

                  {/* View Details */}
                  {prop.status === 'published' && (
                    <Link
                      to={`/properties/${prop.id}`}
                      className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                      title="View on marketplace"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(prop.id)}
                    disabled={actionLoading}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete listing"
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

export default AgentProperties;
