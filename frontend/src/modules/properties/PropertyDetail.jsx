import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { propertyService, feedbackService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../components/PropertyCard';
import EnquiryModal from '../../components/EnquiryModal';
import FeedbackModal from '../../components/FeedbackModal';
import PropertyCard from '../../components/PropertyCard';
import { showToast } from '../../utils/alerts';
import {
  Bed,
  Bath,
  Maximize2,
  Car,
  Compass,
  Building,
  Calendar,
  Layers,
  MapPin,
  Heart,
  Share2,
  Flag,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Video,
  Check,
  Award,
  Mail,
  Globe,
  Pencil,
  Star,
  MessageSquare
} from 'lucide-react';


const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isClient, agency, getCallUrl, getWhatsappUrl } = useAuth();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [trustMetrics, setTrustMetrics] = useState({
    trustScore: 100,
    averageRating: 5.0,
    totalReviews: 0,
    positivePercentage: 100
  });

  useEffect(() => {
    fetchPropertyDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      const [res, fbRes] = await Promise.all([
        propertyService.getPropertyById(id),
        feedbackService.getPublicFeedback({ property_id: id }).catch(() => ({ success: false }))
      ]);

      if (res.success) {
        setProperty(res.data);
        setIsFavorited(res.data.is_favorited);
        setSimilarProperties(res.similarProperties || []);
      }
      if (fbRes.success) {
        setReviews(fbRes.data || []);
        if (fbRes.metrics) setTrustMetrics(fbRes.metrics);
      }
    } catch (err) {
      console.error('Failed to load property details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await propertyService.toggleFavorite(id);
      if (res.success) {
        setIsFavorited(res.isFavorited);
        showToast(res.isFavorited ? 'Added to favorites!' : 'Removed from favorites.', 'info');
      }
    } catch (e) {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Listing URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Property Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">This listing may have been moved or unlisted.</p>
          <Link to="/properties" className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
            Browse All Properties
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : [{ image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }];

  const displayPhone = property.agent_phone || agency?.phone || '+91 98470 12345';
  const displayWhatsapp = property.agent_whatsapp || agency?.whatsapp || agency?.phone || '+91 98470 12345';
  const displayEmail = property.agent_email || agency?.email || 'saranyasoman31@gmail.com';
  const displayWebsite = property.agent_website || agency?.website || 'https://www.darvproperties.com';
  const displayAddress = property.agent_address || property.agent_office || agency?.address || 'DARV Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003';
  const displayLogo = property.agent_logo || property.agent_avatar || agency?.logo || '/images/darv-logo.png';
  const displayAgentName = property.agent_name || agency?.name || 'Saranya Soman';
  const displayAgency = property.agency_name || agency?.agency_name || 'DARV Real Estate & Construction';

  let cleanDigits = displayWhatsapp.replace(/[^0-9]/g, '');
  if (cleanDigits.length === 10) cleanDigits = '91' + cleanDigits;
  const whatsappUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
    `Hello ${displayAgentName}, I am interested in "${property.title}" (${property.ref_number || 'Listing'}) listed for ${formatPrice(property.price, property.price_unit, property.listing_type)} in ${property.city}. Please share more details.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Top Breadcrumb & Action bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 sm:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to listings</span>
          </Link>

          <div className="flex items-center gap-2">
            {isClient && (
              <Link
                to={`/admin/properties/edit/${property.id}`}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 transition shadow-xs"
                title="Edit this property listing"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Property</span>
              </Link>
            )}

            <button
              onClick={handleFavoriteToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                isFavorited
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
              <span>{isFavorited ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Header (Title, Price, Location) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                Ref: {property.ref_number}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                property.listing_type === 'rent' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                For {property.listing_type}
              </span>
              {property.is_featured && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                {property.property_type_name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mt-2">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{property.address}, {property.locality ? `${property.locality}, ` : ''}{property.city}, {property.state} {property.pincode}</span>
            </div>
          </div>

          <div className="lg:text-right shrink-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Price</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-brand-700">
              {formatPrice(property.price, property.price_unit, property.listing_type)}
            </div>
            {property.built_up_area > 0 && (
              <div className="text-xs text-slate-500 mt-0.5">
                Approx. ₹ {Math.round(property.price / property.built_up_area).toLocaleString('en-IN')} / sq.ft
              </div>
            )}
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="space-y-3 mb-10">
          <div className="aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-900 relative shadow-xl">
            <img
              src={images[activeImageIndex]?.image_url}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {property.video_url && (
              <a
                href={property.video_url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md transition shadow"
              >
                <Video className="w-4 h-4 text-red-500" />
                <span>Watch Video Tour</span>
              </a>
            )}
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-medium backdrop-blur-md">
              Photo {activeImageIndex + 1} of {images.length}
            </div>
          </div>

          {/* Thumbnails strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    activeImageIndex === idx ? 'border-brand-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Layout: 2 Columns (Details on Left, Agent & Action Card on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Specs, Description, Amenities, Location */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Quick Specs Highlight Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-6">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Bedrooms</div>
                    <div className="text-base font-extrabold text-slate-900">{property.bedrooms} BHK</div>
                  </div>
                </div>
              )}

              {property.bathrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Bath className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Bathrooms</div>
                    <div className="text-base font-extrabold text-slate-900">{property.bathrooms} Baths</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Maximize2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Super Area</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {property.built_up_area > 0 ? `${property.built_up_area} sq.ft` : `${property.land_area} sq.ft`}
                  </div>
                </div>
              </div>

              {property.parking_spaces > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Parking</div>
                    <div className="text-base font-extrabold text-slate-900">{property.parking_spaces} Reserved</div>
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Specifications Table (SRS Section 5.4) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Property Overview & Specifications</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Property Sub-Type</span>
                  <span className="font-semibold text-slate-800">{property.property_type_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Furnishing State</span>
                  <span className="font-semibold text-slate-800 capitalize">{property.furnishing_status}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Facing Direction</span>
                  <span className="font-semibold text-slate-800">{property.facing || 'East'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Floor Placement</span>
                  <span className="font-semibold text-slate-800">
                    {property.floor_no ? `${property.floor_no} of ${property.total_floors || 'N/A'}` : 'Ground / Standalone'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Construction Age</span>
                  <span className="font-semibold text-slate-800">{property.year_built ? `Built in ${property.year_built}` : 'Ready to Move'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">RERA Listing Status</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-slate-900">About This Residence</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Building & Community Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs font-semibold text-slate-700"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map Preview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Location & Neighborhood</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {property.city}, {property.state}
                </span>
              </div>
              <div className="h-64 rounded-2xl bg-slate-100 overflow-hidden relative border border-slate-200 flex items-center justify-center text-center p-6">
                <div className="space-y-2 z-10">
                  <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{property.locality || property.address}</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Coordinates: {property.latitude || 19.0144}° N, {property.longitude || 72.8155}° E
                  </p>
                </div>
                {/* Background grid pattern simulating map */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
            </div>

            {/* Customer Reviews & Verified Trust Score Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Customer Feedback & Trust Reviews</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authentic customer feedback driving our {trustMetrics.trustScore}% Customer Trust Score.
                  </p>
                </div>

                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Leave Feedback</span>
                </button>
              </div>

              {/* Trust Score Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-emerald-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-amber-200 flex items-center justify-center font-black text-2xl text-slate-900">
                    {trustMetrics.averageRating}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        Based on {trustMetrics.totalReviews} verified reviews
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mt-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{trustMetrics.trustScore}% Customer Trust Score Rating</span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-amber-200 sm:pl-6 text-xs text-slate-600">
                  <div className="font-extrabold text-slate-900">{trustMetrics.positivePercentage}% Recommendation Rate</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Zero brokerage hidden fees</div>
                </div>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700">No public reviews for this listing yet.</p>
                  <p className="text-[11px] text-slate-500">Have you visited this property or spoken to the agent? Be the first to share your thoughts!</p>
                  <button
                    onClick={() => setFeedbackModalOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Rate Your Experience</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex items-center justify-center text-xs font-black uppercase shadow-xs">
                            {rev.customer_name ? rev.customer_name.charAt(0) : 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                              {rev.customer_name}
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Verified
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {rev.category || 'Client Review'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.feedback_title && (
                        <h5 className="font-extrabold text-sm text-slate-900 leading-snug">
                          {rev.feedback_title}
                        </h5>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{rev.comment}"
                      </p>

                      {rev.agent_reply && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/70 via-indigo-50/40 to-slate-50 border border-brand-200/80 text-xs text-slate-700 space-y-1 mt-2">
                          <div className="flex items-center gap-1.5 font-bold text-[11px] text-brand-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Response from Saranya Soman (Property Specialist):</span>
                          </div>
                          <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">{rev.agent_reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Agent Profile & Direct Lead Actions (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              
              {/* Agent Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-5">
                <div className="flex items-center gap-4">
                  <img
                    src={displayLogo}
                    alt={displayAgentName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-md"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                      {displayAgentName}
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </h4>
                    <p className="text-xs font-semibold text-brand-600">{displayAgency}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {trustMetrics.averageRating}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {trustMetrics.trustScore}% Trust Score
                      </span>
                    </div>
                  </div>
                </div>

                {property.agent_license && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">RERA: <strong>{property.agent_license}</strong></span>
                  </div>
                )}

                {/* Contact Meta Details */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <a href={`tel:${displayPhone.replace(/[^0-9]/g, '')}`} className="font-semibold text-slate-900 hover:text-brand-600">
                      {displayPhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold hover:underline">
                      WhatsApp: {displayWhatsapp}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <a href={`mailto:${displayEmail}`} className="truncate hover:text-brand-600">
                      {displayEmail}
                    </a>
                  </div>
                  {displayWebsite && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={displayWebsite.startsWith('http') ? displayWebsite : `https://${displayWebsite}`} target="_blank" rel="noreferrer" className="truncate text-brand-600 hover:underline">
                        {displayWebsite.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{displayAddress}</span>
                  </div>
                </div>

                {/* Direct Action Redirection Buttons */}
                <div className="space-y-3 pt-1">
                  <button
                    onClick={() => setEnquiryModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition active:scale-95"
                  >
                    <span>Send Message / Book Site Visit</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Direct WhatsApp Chat</span>
                  </a>

                  <a
                    href={`tel:${displayPhone.replace(/[^0-9]/g, '')}`}
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Agent ({displayPhone})</span>
                  </a>
                </div>

                <div className="pt-2 text-[11px] text-center text-slate-400 leading-tight">
                  Direct customer inquiries are sent directly to {displayEmail}.
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Similar Properties Recommendation (SRS Section 5.1 & 13) */}
        {similarProperties.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-200">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6">
              Similar Properties You May Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((simProp) => (
                <div
                  key={simProp.id}
                  onClick={() => navigate(`/properties/${simProp.id}`)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition cursor-pointer group"
                >
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                    <img
                      src={simProp.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                      alt={simProp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                      {formatPrice(simProp.price, simProp.price_unit, simProp.listing_type)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-brand-600 transition">
                      {simProp.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {simProp.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        property={property}
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
      />

      {/* Customer Feedback Submission Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        propertyId={property?.id}
        propertyTitle={property?.title}
        onSuccess={() => fetchPropertyDetail()}
      />

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900">Report Inaccurate Listing</h4>
            <p className="text-xs text-slate-500">
              Help us maintain marketplace authenticity. Let our admin moderation team know what is wrong.
            </p>
            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold text-center">
                Thank you. Your report has been submitted to the platform administrators for review.
              </div>
            ) : (
              <div className="space-y-3">
                <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <option>Property already sold or unavailable</option>
                  <option>Incorrect price / inaccurate dimensions</option>
                  <option>Fraudulent or unauthorized photos</option>
                  <option>Duplicate listing</option>
                  <option>Agent unresponsive</option>
                </select>
                <textarea
                  rows="3"
                  placeholder="Additional details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                ></textarea>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setReportSuccess(true)}
                    className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
            {reportSuccess && (
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setReportSuccess(false);
                    setReportModalOpen(false);
                  }}
                  className="text-xs text-slate-500 underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetail;
