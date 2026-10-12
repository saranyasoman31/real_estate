import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Globe,
  Settings
} from 'lucide-react';

const Footer = () => {
  const { agency, getCallUrl, getWhatsappUrl } = useAuth();

  const phone = agency?.phone || '+91 98470 12345';
  const whatsapp = agency?.whatsapp || agency?.phone || '+91 6282649279';
  const email = agency?.email || 'saranyasoman31@gmail.com';
  const website = agency?.website || 'https://www.darvproperties.com';
  const address = agency?.address || agency?.office_address || 'DARV Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003';
  const agentName = agency?.name || 'Saranya Soman';
  const agencyName = agency?.agency_name || 'DARV Real Estate & Construction';

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t-2 border-amber-400/40 mt-20 relative">
      {/* Top gold accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <div className="bg-white p-2.5 rounded-2xl shadow-md border border-amber-300/60 inline-flex items-center group-hover:shadow-amber-400/20 transition">
                <img
                  src="/images/darv-logo.png"
                  alt="DARV Real Estate & Construction"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-xs font-bold text-amber-400/90 tracking-wider uppercase">
              Dreams Architecture Realty Value
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The official property showcase of {agencyName}. Connecting home buyers, NRIs, and investors directly with premier apartments, luxury villas, and prime plots across Trivandrum with zero middlemen.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Real Estate Advisory & Clear Titles</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties?listing_type=sale" className="hover:text-white transition">Buy Property</Link></li>
              <li><Link to="/properties?listing_type=rent" className="hover:text-white transition">Rent Property</Link></li>
              <li><Link to="/properties?type=commercial" className="hover:text-white transition">Commercial Spaces</Link></li>
              <li><Link to="/properties?type=plot" className="hover:text-white transition">Residential Plots</Link></li>
              <li><Link to="/properties?is_featured=true" className="hover:text-white transition">Featured Collection</Link></li>
            </ul>
          </div>

          {/* Direct Agent Contact & Redirection */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Direct Contact</h4>
            <ul className="space-y-3 text-xs">
              <li className="text-slate-300 font-bold">{agentName}</li>
              <li>
                <a
                  href={getCallUrl(phone)}
                  className="hover:text-white flex items-center gap-2 text-slate-300 transition"
                  title="Direct Phone Call"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={getWhatsappUrl('Hello, I am interested in property listings in Trivandrum.')}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-2 text-emerald-400 font-semibold transition"
                  title="Direct WhatsApp Chat"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp: {whatsapp}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-white flex items-center gap-2 text-slate-300 transition"
                  title="Customer Request Email"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </a>
              </li>
              {website && (
                <li>
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white flex items-center gap-2 text-slate-400 transition"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{website.replace(/^https?:\/\//, '')}</span>
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2 text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="leading-tight">{address}</span>
              </li>
            </ul>
          </div>

          {/* Client Owner Management */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Agent Portal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/admin" className="hover:text-white transition">Agent Login</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition">Admin Dashboard</Link></li>
              <li><Link to="/admin/properties/add" className="hover:text-white transition">Upload Property</Link></li>
              <li><Link to="/admin/inquiries" className="hover:text-white transition">Customer Requests & CRM</Link></li>
              <li><Link to="/admin/profile" className="hover:text-amber-400 flex items-center gap-1.5 font-medium transition"><Settings className="w-3.5 h-3.5" /> Agent Profile & Setup</Link></li>
              <li><Link to="/admin/feedback" className="hover:text-amber-400 flex items-center gap-1.5 font-medium transition">⭐ Customer Trust & Reviews</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {agencyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
