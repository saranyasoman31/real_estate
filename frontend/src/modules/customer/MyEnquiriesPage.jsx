import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enquiryService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../components/PropertyCard';
import {
  FileText,
  Building,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const MyEnquiriesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyEnquiries();
  }, [isAuthenticated]);

  const fetchMyEnquiries = async () => {
    try {
      setLoading(true);
      const res = await enquiryService.getMyEnquiries();
      if (res.success) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to load my enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
            SRS v1.0 Section 5.6
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            My Submitted Inquiries & Site Visits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track responsiveness and follow-ups from verified agents on properties you inquired about.
          </p>
        </div>

        {/* Inquiries list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-32 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Inquiries Submitted Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Whenever you send an enquiry or book a site visit on any property, your correspondence history will appear here.
            </p>
            <Link
              to="/properties"
              className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
            >
              Discover Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => {
              const cleanPhone = (enq.agent_phone || '').replace(/[^0-9]/g, '');
              const waText = encodeURIComponent(
                `Hello ${enq.agent_name}, I submitted an inquiry for "${enq.property_title}" (${enq.ref_number}) and wanted to follow up.`
              );
              return (
                <div
                  key={enq.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={enq.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'}
                        alt=""
                        className="w-16 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {enq.ref_number}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {enq.city}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-0.5">
                          {enq.property_title}
                        </h3>
                        <p className="text-xs font-extrabold text-slate-800">
                          {formatPrice(enq.price, enq.price_unit, enq.listing_type)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        enq.status === 'new' ? 'bg-blue-50 text-blue-800' :
                        enq.status === 'contacted' ? 'bg-amber-50 text-amber-800' :
                        enq.status === 'follow_up' ? 'bg-purple-50 text-purple-800' :
                        enq.status === 'closed' ? 'bg-emerald-50 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        Status: {enq.status.replace('_', ' ')}
                      </span>

                      <Link
                        to={`/properties/${enq.property_id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                        title="View Property"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Message & Agent details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Realtor</span>
                      <p className="font-bold text-slate-800">{enq.agent_name} ({enq.agency_name})</p>
                      <div className="flex items-center gap-2 pt-1">
                        {enq.agent_phone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${waText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Agent</span>
                          </a>
                        )}
                        {enq.agent_phone && (
                          <a
                            href={`tel:${enq.agent_phone}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Your Message Sent</span>
                      <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{enq.message}"
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Preferred time: {enq.preferred_time || 'Anytime'} • Submitted {new Date(enq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyEnquiriesPage;
