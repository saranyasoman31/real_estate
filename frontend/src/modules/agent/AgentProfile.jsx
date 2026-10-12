import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showAlertSuccess, showAlertError, showToast } from '../../utils/alerts';
import { getAssetUrl } from '../../utils/paths';
import {
  ShieldCheck,
  CheckCircle2,
  Upload,
  Save,
  Building,
  User,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Camera,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const AgentProfile = () => {
  const { refreshAgency, getCallUrl, getWhatsappUrl } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    agency_name: '',
    license_number: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    office_address: '',
    logo: '',
    logo_url: '',
    bio: '',
    operating_cities: 'Trivandrum',
    experience_years: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await agentService.getMyProfile();
      if (res.success && res.data) {
        setProfile({
          ...res.data,
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          whatsapp: res.data.whatsapp || '',
          website: res.data.website || '',
          address: res.data.address || res.data.office_address || '',
          logo: res.data.logo || res.data.logo_url || '',
          agency_name: res.data.agency_name || '',
          license_number: res.data.license_number || '',
          bio: res.data.bio || '',
          operating_cities: res.data.operating_cities || 'Trivandrum'
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showAlertError('Failed to load profile', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAlertError('File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);
      const res = await agentService.uploadLogo(formData);
      if (res.success && res.logo_url) {
        setProfile(prev => ({
          ...prev,
          logo: res.logo_url,
          logo_url: res.logo_url
        }));
        showToast('Logo uploaded successfully!', 'success');
        refreshAgency();
      }
    } catch (err) {
      showAlertError('Upload Failed', err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: profile.name,
        logo: profile.logo || profile.logo_url,
        logo_url: profile.logo || profile.logo_url,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        email: profile.email,
        website: profile.website,
        address: profile.address || profile.office_address,
        office_address: profile.address || profile.office_address,
        agency_name: profile.agency_name,
        license_number: profile.license_number,
        bio: profile.bio,
        operating_cities: profile.operating_cities,
        experience_years: profile.experience_years
      };

      const res = await agentService.updateMyProfile(payload);
      if (res.success) {
        await refreshAgency();
        showAlertSuccess(
          'Agent Profile Saved!',
          'Your profile, contact numbers, email push destination, and application redirections have been updated successfully.'
        );
      }
    } catch (err) {
      showAlertError('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const cleanPhone = (profile.phone || '').replace(/[^0-9]/g, '');
  const cleanWhatsapp = (profile.whatsapp || profile.phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Agent Profile & Contact Settings
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Configuration
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure your primary name, logo, direct phone, WhatsApp, customer request email, website, and office address.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Live Customer Preview Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Building className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative group w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/10 shadow-2xl bg-slate-800 shrink-0">
                <img
                  src={getAssetUrl(profile.logo || profile.logo_url || '/images/darv-icon.png')}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[10px] font-bold text-white">
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{profile.name || 'Saranya Soman'}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Official Agent
                  </span>
                </div>
                <p className="text-sm text-gold-300 font-semibold">{profile.agency_name || 'DARV Real Estate & Construction'}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    {profile.address || 'Trivandrum, Kerala'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-brand-400" />
                    {profile.email || 'saranyasoman31@gmail.com'}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Redirection Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 md:pt-0">
              <a
                href={getWhatsappUrl('Hello, testing the WhatsApp redirection from Agent Profile')}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Test WhatsApp ({profile.whatsapp || '+91 98470 12345'})</span>
              </a>

              <a
                href={getCallUrl(profile.phone)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/20 backdrop-blur transition"
              >
                <Phone className="w-4 h-4" />
                <span>Test Call ({profile.phone || '+91 98470 12345'})</span>
              </a>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Agent Identity & Contact Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details dynamically power all direct call, WhatsApp links, and lead notification emails across the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Agent / Owner Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Saranya Soman"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 2. Agency Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Agency / Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.agency_name}
                  onChange={(e) => setProfile({ ...profile, agency_name: e.target.value })}
                  placeholder="e.g. DARV Real Estate & Construction"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 3. Logo (File Upload or URL) */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Agent / Agency Logo & Avatar <span className="text-slate-400 font-normal">(Visible on property details and cards)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs shrink-0">
                  <img
                    src={getAssetUrl(profile.logo || profile.logo_url || '/images/darv-icon.png')}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste Logo Image URL or upload below..."
                      value={profile.logo || profile.logo_url || ''}
                      onChange={(e) => setProfile({ ...profile, logo: e.target.value, logo_url: e.target.value })}
                      className="flex-1 w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />

                    <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingLogo}
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    PNG, JPG, or SVG. Square ratio (1:1) recommended for optimal display.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Phone (Direct Call Redirection) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Calling Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="e.g. +91 98470 12345"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Powers the <strong>"Call Agent"</strong> button across property pages and cards.
              </p>
            </div>

            {/* 5. WhatsApp (Direct WhatsApp Redirection) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={profile.whatsapp}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  placeholder="e.g. +919847012345"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
                <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Powers the <strong>"Direct WhatsApp"</strong> chat buttons with prefilled inquiry messages.
              </p>
            </div>

            {/* 6. Email (Destination for Customer Inquiries) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Inquiry Destination Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="e.g. saranyasoman31@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-brand-600 font-medium mt-1">
                Customer requests, site visit submissions, and inquiries are pushed directly to this inbox.
              </p>
            </div>

            {/* 7. Website */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Agency / Personal Website URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="e.g. https://www.darvproperties.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Official website link showcased in the portal footer and email pushes.
              </p>
            </div>

            {/* 8. Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Office / Business Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value, office_address: e.target.value })}
                  placeholder="e.g. DARV Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* 9. RERA License & Operating Cities */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                RERA License Number
              </label>
              <input
                type="text"
                value={profile.license_number}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                placeholder="e.g. K-RERA/PRJ/TVM/2026"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operating Cities / Focus Area
              </label>
              <input
                type="text"
                value={profile.operating_cities}
                onChange={(e) => setProfile({ ...profile, operating_cities: e.target.value })}
                placeholder="Trivandrum"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* 10. Bio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bio & Agency Overview
              </label>
              <textarea
                rows="3"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Describe your property advisory credentials, specialization in Trivandrum luxury homes, flats, or commercial spaces..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Changes take effect immediately on public listings, WhatsApp redirections, and call buttons.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AgentProfile;
