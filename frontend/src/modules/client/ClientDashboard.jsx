import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyService, enquiryService, feedbackService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../components/PropertyCard';
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  PlusCircle,
  TrendingUp,
  Phone,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Settings,
  Mail,
  Pencil,
  Star
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [trustStats, setTrustStats] = useState({ trustScore: 100, averageRating: 5.0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, propsRes, trustRes] = await Promise.all([
        propertyService.getClientDashboard(),
        propertyService.getClientProperties({ limit: 6 }),
        feedbackService.getTrustStats().catch(() => ({ success: false }))
      ]);

      if (dashRes.success) {
        setStats(dashRes.stats);
        setRecentEnquiries(dashRes.recentEnquiries || []);
      }
      if (propsRes.success) {
        setProperties(propsRes.data);
      }
      if (trustRes.success && trustRes.metrics) {
        setTrustStats(trustRes.metrics);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(true);
      const res = await propertyService.changeStatus(id, newStatus);
      if (res.success) {
        loadDashboard();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
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

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      setActionLoading(true);
      const res = await propertyService.deleteProperty(id);
      if (res.success) {
        loadDashboard();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user?.agency_name || user?.name || 'Property Management Console'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  Owner Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Upload new listings, update availability status, and manage incoming buyer and tenant leads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/client/properties/add"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/25 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload New Property</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inventory</span>
              <Building2 className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_properties || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              <strong className="text-emerald-600">{stats?.published_properties || 0}</strong> live on website
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sold / Rented</span>
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600 mt-2">
              {(parseInt(stats?.sold_properties || 0) + parseInt(stats?.rented_properties || 0))}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Deals finalized
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Inquiries</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-2">{stats?.total_enquiries || 0}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">
              {stats?.new_enquiries || 0} new prospective leads
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_views || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Property impressions
            </div>
          </div>

          <Link
            to="/admin/feedback"
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trust Score</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2 flex items-baseline gap-1">
              <span>{trustStats?.trustScore || 100}%</span>
              <span className="text-xs font-semibold text-slate-400">({trustStats?.averageRating || '5.0'} ★)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-amber-600 font-medium">
              <span>{trustStats?.totalReviews || 0} customer reviews</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition transform" />
            </div>
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/client/properties"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">Manage Properties</h4>
                <p className="text-xs text-slate-400">Edit prices, mark sold, toggle featured</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition transform" />
          </Link>

          <Link
            to="/client/inquiries"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">Customer Leads CRM</h4>
                <p className="text-xs text-slate-400">Respond via WhatsApp & phone call</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition transform" />
          </Link>

          <Link
            to="/admin/feedback"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition">Customer Trust & Reviews</h4>
                <p className="text-xs text-slate-400">{trustStats?.trustScore || 100}% Trust Score • Manage feedback</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition transform" />
          </Link>

          <Link
            to="/admin/profile"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">Agent Profile & Setup</h4>
                <p className="text-xs text-slate-400">Name, logo, phone, WhatsApp, email</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition transform" />
          </Link>
        </div>

        {/* Properties Quick Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Your Property Inventory</h3>
              <p className="text-xs text-slate-500">Live listings displayed to customers on the website</p>
            </div>
            <Link to="/client/properties" className="text-xs font-bold text-brand-600 hover:underline">
              View All Inventory →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {properties.slice(0, 5).map((prop) => (
              <div key={prop.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-4">
                  <img
                    src={prop.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                    alt=""
                    className="w-20 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        {prop.ref_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        prop.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        prop.status === 'sold' ? 'bg-purple-100 text-purple-800' :
                        prop.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {prop.status}
                      </span>
                      {prop.is_featured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-current text-amber-600" /> Featured
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {prop.property_type_name} • {prop.city}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-1">{prop.title}</h4>
                    <p className="text-xs text-slate-600 font-extrabold">
                      {formatPrice(prop.price, prop.price_unit, prop.listing_type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status toggle buttons */}
                  {prop.status === 'published' ? (
                    <button
                      onClick={() => handleStatusChange(prop.id, prop.listing_type === 'rent' ? 'rented' : 'sold')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      Mark {prop.listing_type === 'rent' ? 'Rented' : 'Sold'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(prop.id, 'published')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold"
                    >
                      Mark Available
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleFeatured(prop.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition ${
                      prop.is_featured
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{prop.is_featured ? 'Featured' : 'Feature'}</span>
                  </button>

                  {/* Edit Property Details */}
                  <Link
                    to={`/admin/properties/edit/${prop.id}`}
                    className="px-2.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1 transition border border-brand-200"
                    title="Edit Property Details"
                  >
                    <Pencil className="w-3.5 h-3.5 text-brand-600" />
                    <span>Edit</span>
                  </Link>

                  <Link
                    to={`/properties/${prop.id}`}
                    target="_blank"
                    className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition"
                    title="View Customer Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDeleteProperty(prop.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Inquiries Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Customer Leads</h3>
              <p className="text-xs text-slate-500">Respond directly to interested buyers & tenants</p>
            </div>
            <Link to="/client/inquiries" className="text-xs font-bold text-brand-600 hover:underline">
              View All Inquiries →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentEnquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No customer inquiries yet. Published properties will receive direct inquiries here.
              </div>
            ) : (
              recentEnquiries.map((enq) => {
                const cleanPhone = (enq.customer_phone || '').replace(/[^0-9]/g, '');
                return (
                  <div key={enq.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{enq.customer_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          enq.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          enq.status === 'contacted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {enq.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-brand-700">{enq.property_title} ({enq.ref_number})</p>
                      <p className="text-xs text-slate-600 max-w-xl italic">"{enq.message}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to="/admin/inquiries"
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                        title="Open CRM to push email response"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Push</span>
                      </Link>
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${enq.customer_phone}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;
