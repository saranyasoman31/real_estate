import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../../services/api';
import { formatPrice } from '../../components/PropertyCard';
import { showConfirmDialog, showAlertSuccess, showAlertError, showToast } from '../../utils/alerts';
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Eye,
  Search,
  ExternalLink,
  Sparkles,
  Home,
  Check,
  RefreshCw,
  Pencil
} from 'lucide-react';

const ClientProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getClientProperties({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined
      });
      if (res.success) {
        setProperties(res.data);
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(true);
      const res = await propertyService.changeStatus(id, newStatus);
      if (res.success) {
        showToast(`Property marked as "${newStatus}"!`, 'success');
        fetchProperties();
      }
    } catch (err) {
      showAlertError('Update Failed', err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      setActionLoading(true);
      const res = await propertyService.toggleFeatured(id);
      if (res.success) {
        showToast(res.message || 'Featured status updated.', 'info');
        fetchProperties();
      }
    } catch (err) {
      showAlertError('Failed', err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Property Listing?',
      text: 'This listing and its customer inquiries will be permanently removed.',
      confirmButtonText: 'Yes, Delete Listing'
    });
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await propertyService.deleteProperty(id);
      if (res.success) {
        showAlertSuccess('Deleted', 'Property has been permanently removed.');
        fetchProperties();
      }
    } catch (err) {
      showAlertError('Delete Failed', err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (prop) => {
    if (prop.status === 'published') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Live & Available
        </span>
      );
    }
    if (prop.status === 'sold') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
          Sold
        </span>
      );
    }
    if (prop.status === 'rented') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
          Rented
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Property Inventory</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                Direct Owner Management
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Add new properties, toggle featured status, update prices, and mark properties sold or rented.
            </p>
          </div>
          <Link
            to="/client/properties/add"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/25 transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Property</span>
          </Link>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'published', label: 'Live & Available' },
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

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by title, location or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
          </form>
        </div>

        {/* Listings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-28 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No properties in this filter</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a property or change your filter selection.</p>
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
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {prop.ref_number}
                      </span>
                      {getStatusBadge(prop)}
                      {prop.is_featured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600 fill-current" /> Featured
                        </span>
                      )}
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
                      <span>{prop.views_count || 0} Customer Views</span>
                      <span>•</span>
                      <span>{prop.enquiry_count || 0} Inquiries</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0">
                  
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

                  {/* Re-publish (if sold, rented or draft) */}
                  {['sold', 'rented', 'draft'].includes(prop.status) && (
                    <button
                      onClick={() => handleStatusChange(prop.id, 'published')}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Publish Live</span>
                    </button>
                  )}

                  {/* Toggle Featured */}
                  <button
                    onClick={() => handleToggleFeatured(prop.id)}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                      prop.is_featured
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{prop.is_featured ? 'Featured' : 'Make Featured'}</span>
                  </button>

                  {/* Edit Property Details */}
                  <Link
                    to={`/admin/properties/edit/${prop.id}`}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1.5 transition border border-brand-200"
                    title="Edit Property Details"
                  >
                    <Pencil className="w-3.5 h-3.5 text-brand-600" />
                    <span>Edit</span>
                  </Link>

                  {/* View Details on Public Marketplace */}
                  <Link
                    to={`/properties/${prop.id}`}
                    target="_blank"
                    className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                    title="View Customer Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(prop.id)}
                    disabled={actionLoading}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete property"
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

export default ClientProperties;
