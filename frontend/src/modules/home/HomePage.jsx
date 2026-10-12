import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService, masterDataService, feedbackService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getAssetUrl } from '../../utils/paths';
import SearchBar from '../../components/SearchBar';
import PropertyCard from '../../components/PropertyCard';
import EnquiryModal from '../../components/EnquiryModal';
import FeedbackModal from '../../components/FeedbackModal';
import {
  Building2,
  Home,
  Briefcase,
  Landmark,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Star,
  MessageSquare,
  Quote,
  ThumbsUp,
  Check,
  BadgeCheck,
  MapPin
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { agency } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestProperties, setLatestProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState({ cities: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPropForContact, setSelectedPropForContact] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [feedbackCategory, setFeedbackCategory] = useState('all');
  const [trustStats, setTrustStats] = useState({
    trustScore: 100,
    averageRating: 5.0,
    totalReviews: 0,
    positivePercentage: 100,
    grade: 'A+ Verified Developer'
  });

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [featRes, lateRes, typesRes, locsRes, fbRes] = await Promise.all([
        propertyService.getProperties({ is_featured: 'true', limit: 6 }),
        propertyService.getProperties({ limit: 6, sort: 'newest' }),
        masterDataService.getPropertyTypes(),
        masterDataService.getLocations(),
        feedbackService.getPublicFeedback({ limit: 12 }).catch(() => ({ success: false }))
      ]);

      if (featRes.success) setFeaturedProperties(featRes.data);
      if (lateRes.success) setLatestProperties(lateRes.data);
      if (typesRes.success) setPropertyTypes(typesRes.data);
      if (locsRes.success) setLocations(locsRes);
      if (fbRes.success) {
        setTestimonials(fbRes.data || []);
        if (fbRes.metrics) setTrustStats(fbRes.metrics);
      }
    } catch (err) {
      console.error('Error loading homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'apartment': return Building2;
      case 'villa': return Home;
      case 'house': return Home;
      case 'plot': return Landmark;
      case 'commercial': return Briefcase;
      default: return Building2;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white">
        
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-gold-400/40 text-xs font-bold backdrop-blur-md mb-6 text-gold-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>DARV Real Estate & Construction • Dreams Architecture Realty Value</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Find Your Dream Home Directly <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              Without Any Middlemen
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Directly connect with our dedicated property advisory team. 100% genuine developer listings, transparent pricing, and instant WhatsApp connects.
          </p>

          {/* Hero Search Box */}
          <div className="mt-10">
            <SearchBar />
          </div>

          {/* Trust stats counter */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Direct Developer Listings</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-400">Zero</div>
              <div className="text-xs text-slate-400 mt-0.5">Brokerage Overhead</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">₹ 850 Cr+</div>
              <div className="text-xs text-slate-400 mt-0.5">Portfolio Value</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {trustStats.trustScore}%
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Trust Score ({trustStats.averageRating} ★)
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. PROPERTY TYPE SHORTCUTS (SRS Section 5.1) */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Explore Property Categories</h2>
                <p className="text-xs text-slate-500">Discover tailored options for investments and homes</p>
              </div>
              <Link to="/properties" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View All Categories <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {propertyTypes.map((type) => {
                const IconComponent = getCategoryIcon(type.slug);
                return (
                  <button
                    key={type.id}
                    onClick={() => navigate(`/properties?type=${type.slug}`)}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-brand-300 bg-slate-50/60 hover:bg-brand-50/30 transition-all duration-200 text-left group flex flex-col justify-between"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-brand-600 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-700">{type.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{type.property_count || 0} Listings</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES (SRS Section 5.1 & 13) */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Handpicked Exclusive Collection
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Properties</h2>
            </div>
            <Link
              to="/properties?is_featured=true"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              Browse all featured <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onContactClick={(p) => setSelectedPropForContact(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Featured Listings Coming Soon</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Our property specialist is currently adding fresh, verified property listings in Trivandrum. Check back shortly!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. POPULAR LOCATIONS IN TRIVANDRUM */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Explore Properties in Trivandrum</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Browse premier apartments, luxury gated villas, residential plots, and IT commercial spaces across Trivandrum's prime zones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Kowdiar',
                tagline: 'Palace Avenue & Luxury Residences',
                keyword: 'Kowdiar',
                image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'
              },
              {
                name: 'Kazhakkoottam',
                tagline: 'Technopark Phase 1-3 & IT Corridor',
                keyword: 'Kazhakkoottam',
                image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80'
              },
              {
                name: 'Pattom',
                tagline: 'Central City & Top Schools Zone',
                keyword: 'Pattom',
                image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
              },
              {
                name: 'Vellayambalam',
                tagline: 'Premier Green Villas & Enclaves',
                keyword: 'Vellayambalam',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
              }
            ].map((loc, idx) => (
              <button
                key={idx}
                onClick={() => navigate(`/properties?city=Trivandrum&keyword=${encodeURIComponent(loc.keyword)}`)}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-left cursor-pointer"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-brand-500/80 text-[10px] font-bold tracking-wide uppercase mb-1">
                    Trivandrum
                  </span>
                  <h4 className="font-bold text-base leading-tight group-hover:text-brand-300 transition">{loc.name}</h4>
                  <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-1">{loc.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LATEST PROPERTIES */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Fresh On The Marketplace
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Latest Properties</h2>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              View all listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : latestProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onContactClick={(p) => setSelectedPropForContact(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">New Inventory in Trivandrum Coming Soon</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Fresh verified properties are currently being onboarded. Reach out to our advisor Saranya Soman directly for exclusive early inquiries.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS & TRUST SCORE SECTION */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-amber-50/20 to-white relative overflow-hidden border-t border-slate-200/80">
        
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-12 left-1/4 -translate-x-1/2 w-[650px] h-[350px] bg-amber-300/15 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-12 right-1/4 translate-x-1/2 w-[550px] h-[350px] bg-blue-300/15 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header & Main Call to Action */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300/70 text-amber-900 text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>100% Genuine Trivandrum Customer Experiences</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Authentic Customer Feedback &{' '}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-brand-600 bg-clip-text text-transparent">
                Trust Score
              </span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Real testimonials from genuine homebuyers, tenants, and NRI investors in Trivandrum — driving our verified 100% Customer Trust Score with direct developer pricing and zero brokerage.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Star className="w-4 h-4 fill-slate-950" />
                <span>Rate Your Experience / Leave Feedback</span>
              </button>
              <Link
                to="/properties"
                className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs transition shadow-xs flex items-center gap-1.5"
              >
                <span>Browse Verified Properties</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Central Executive Trust Scorecard */}
          <div className="bg-white/95 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/80 border border-slate-200/90 relative z-10 mb-12 overflow-hidden">
            {/* Top gradient highlight strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-brand-600"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Column 1: Trust Score Radial Badge (Cols 1-4) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-white border border-amber-200/80 text-center shadow-xs">
                <div className="relative mb-3">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-amber-300 p-1.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-slate-950 leading-none tracking-tight">
                        {trustStats.trustScore}%
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 mt-1">
                        Trust Score
                      </span>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 shadow-xs mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{trustStats.grade || 'A+ Verified Developer'}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-black text-slate-900 ml-1.5">
                    {trustStats.averageRating} / 5.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Based on <strong className="text-slate-800">{trustStats.totalReviews}</strong> authentic reviews
                </p>
              </div>

              {/* Column 2: Rating Breakdown & Recommendation Rate (Cols 5-8) */}
              <div className="lg:col-span-4 space-y-4 px-0 sm:px-4 lg:border-r lg:border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="text-2xl font-black text-emerald-700 flex items-center gap-1.5">
                      <ThumbsUp className="w-5 h-5 text-emerald-600" />
                      <span>{trustStats.positivePercentage}%</span>
                    </div>
                    <div className="text-xs font-bold text-slate-700">Recommendation Rate</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                      100% Verified
                    </span>
                  </div>
                </div>

                {/* Distribution Bars */}
                <div className="space-y-2 text-xs">
                  {[
                    { star: 5, pct: trustStats.breakdown?.[5] ? Math.round((trustStats.breakdown[5] / (trustStats.totalReviews || 1)) * 100) : (trustStats.totalReviews > 0 ? 100 : 0) },
                    { star: 4, pct: trustStats.breakdown?.[4] ? Math.round((trustStats.breakdown[4] / (trustStats.totalReviews || 1)) * 100) : 0 },
                    { star: 3, pct: trustStats.breakdown?.[3] ? Math.round((trustStats.breakdown[3] / (trustStats.totalReviews || 1)) * 100) : 0 },
                    { star: 2, pct: trustStats.breakdown?.[2] ? Math.round((trustStats.breakdown[2] / (trustStats.totalReviews || 1)) * 100) : 0 },
                    { star: 1, pct: trustStats.breakdown?.[1] ? Math.round((trustStats.breakdown[1] / (trustStats.totalReviews || 1)) * 100) : 0 },
                  ].map((row) => (
                    <div key={row.star} className="flex items-center gap-2">
                      <span className="w-12 text-[11px] font-bold text-slate-600 flex items-center gap-0.5">
                        {row.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                          style={{ width: `${row.pct}%` }}
                        ></div>
                      </div>
                      <span className="w-10 text-[11px] font-bold text-slate-500 text-right">
                        {row.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: The Three Client Guarantees (Cols 9-12) */}
              <div className="lg:col-span-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  The DARV Advisory Guarantee
                </h4>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Zero Brokerage Guarantee</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      100% direct developer pricing with zero hidden commission markups.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Verified Title Clearances</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      Complete corporation sanctioned & legal encumbrance checks on all listings.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">Dedicated Advisor Support</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      One-on-one property walkthroughs directly guided by Saranya Soman.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Testimonials Filter & Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">
                Verified Client Testimonials
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                {testimonials.length}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {[
                { id: 'all', label: 'All Reviews' },
                { id: 'Property Purchase', label: 'Property Purchase' },
                { id: 'Trust & Transparency', label: 'Trust & Transparency' },
                { id: 'Documentation & Legal Clearances', label: 'Legal & NRI' },
                { id: 'Overall Experience', label: 'Overall Experience' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFeedbackCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    feedbackCategory === tab.id
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Testimonial Cards Grid */}
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {testimonials
                .filter((t) => feedbackCategory === 'all' || t.category === feedbackCategory)
                .map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-amber-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
                  >
                    {/* Top gradient hover line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Decorative watermark quote */}
                    <div className="absolute top-4 right-4 text-slate-100 group-hover:text-amber-100/70 transition-colors pointer-events-none select-none">
                      <Quote className="w-14 h-14 stroke-[1.2]" />
                    </div>

                    <div className="space-y-4 relative z-10">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80">
                          {t.category || 'Client Review'}
                        </span>
                      </div>

                      {/* Title */}
                      {t.feedback_title && (
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors">
                          {t.feedback_title}
                        </h4>
                      )}

                      {/* Review Comment */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed italic">
                        "{t.comment}"
                      </p>

                      {/* Agent Official Response Bubble */}
                      {t.agent_reply && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/70 via-indigo-50/40 to-slate-50 border border-brand-200/80 space-y-1.5 shadow-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={getAssetUrl(agency?.logo || "/images/darv-icon.png")}
                              alt="Saranya Soman"
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-brand-500"
                            />
                            <span className="font-extrabold text-[11px] text-brand-800 flex items-center gap-1">
                              Saranya Soman <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            </span>
                            <span className="text-[10px] text-slate-400">Advisor Reply</span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-relaxed pl-7">
                            {t.agent_reply}
                          </p>
                        </div>
                      )}

                    </div>

                    {/* Author Footer */}
                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex items-center justify-center text-xs font-black uppercase shadow-xs">
                          {t.customer_name ? t.customer_name.charAt(0) : 'C'}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1">
                            {t.customer_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {t.property_title ? t.property_title : 'Verified Trivandrum Client'}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>

                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-md text-center max-w-md mx-auto space-y-3 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Quote className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Be the First to Rate Your Experience</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Share your property buying or consultation feedback directly with Saranya Soman and help maintain 100% marketplace transparency.
              </p>
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Submit Feedback</span>
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 7. DIRECT CONSULTATION & SITE VISITS BANNER */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="max-w-xl space-y-3 relative z-10">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                Direct Developer Showcase
              </span>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                Explore Our Properties or Book a Private Site Visit
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Connect directly with our property advisors. Whether you are seeking premium residential apartments, luxury villas, or high-yield commercial spaces, get direct pricing and zero brokerage.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-brand-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Genuine Direct Pricing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Legal Clearances</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant WhatsApp Follow-up</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <Link
                to="/properties"
                className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 shadow-lg text-center transition"
              >
                Browse All Properties
              </Link>
              <Link
                to="/client/dashboard"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md text-center transition"
              >
                Owner Portal
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      {selectedPropForContact && (
        <EnquiryModal
          property={selectedPropForContact}
          isOpen={!!selectedPropForContact}
          onClose={() => setSelectedPropForContact(null)}
        />
      )}

      {/* Customer Feedback Submission Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSuccess={() => loadHomeData()}
      />

    </div>
  );
};

export default HomePage;
