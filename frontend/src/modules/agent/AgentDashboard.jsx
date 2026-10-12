import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  Phone,
  MessageCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [agentProfile, setAgentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await agentService.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentEnquiries(res.recentEnquiries || []);
        setAgentProfile(res.agent);
      }
    } catch (err) {
      console.error('Failed to load agent stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  const isVerified = agentProfile?.verification_status === 'verified';
  const isPending = agentProfile?.verification_status === 'pending';

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                {isVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Agent
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    KYC Pending Review
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {agentProfile?.agency_name || 'Independent Real Estate Agency'} • License: {agentProfile?.license_number || 'Under Verification'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/agent/properties/add"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/25 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Property</span>
            </Link>
          </div>
        </div>

        {/* KYC Notice if Pending */}
        {isPending && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold">Verification in progress:</strong> Your agency documentation is currently under review by our administrator compliance team. You can create draft property listings in the meantime.
            </div>
            <Link to="/agent/profile" className="font-bold underline shrink-0 hover:text-amber-950">
              View KYC Documents
            </Link>
          </div>
        )}

        {/* Metric Cards (SRS Section 6.1) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Listings</span>
              <Building2 className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_listings || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">{stats?.published_listings || 0}</span> published & live
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Under Admin Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{stats?.pending_approval || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Pending moderator approval
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-2">{stats?.total_enquiries || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-blue-600">{stats?.new_enquiries || 0}</span> new uncontacted leads
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Views</span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_views || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Impressions on marketplace
            </div>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/agent/properties"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">Manage Properties</h4>
                <p className="text-xs text-slate-400">View, edit, mark sold or submit</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition transform" />
          </Link>

          <Link
            to="/agent/enquiries"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">Leads CRM Pipeline</h4>
                <p className="text-xs text-slate-400">Follow up, notes & WhatsApp connect</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition transform" />
          </Link>

          <Link
            to="/agent/profile"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 shadow-xs hover:shadow transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">KYC Documents & Profile</h4>
                <p className="text-xs text-slate-400">RERA certificates & office address</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition transform" />
          </Link>
        </div>

        {/* Recent Enquiries / Leads Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Recent Customer Inquiries</h3>
              <p className="text-xs text-slate-500">Respond directly via Call or WhatsApp to close deals faster</p>
            </div>
            <Link to="/agent/enquiries" className="text-xs font-bold text-brand-600 hover:underline">
              View All Inquiries →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentEnquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No inquiries received yet. Published properties will begin receiving buyer and tenant leads.
              </div>
            ) : (
              recentEnquiries.map((enq) => {
                const cleanPhone = (enq.customer_phone || '').replace(/[^0-9]/g, '');
                return (
                  <div key={enq.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
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
                      <p className="text-xs font-medium text-brand-700">{enq.property_title} ({enq.ref_number})</p>
                      <p className="text-xs text-slate-600 max-w-xl italic">"{enq.message}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${enq.customer_phone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
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

export default AgentDashboard;
