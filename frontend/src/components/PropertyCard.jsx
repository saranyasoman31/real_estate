import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propertyService } from '../services/api';
import { showToast } from '../utils/alerts';
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  Eye,
  ArrowRight
} from 'lucide-react';

export const formatPrice = (price, unit, listingType) => {
  const num = parseFloat(price);
  if (isNaN(num)) return 'Price on Request';

  let formatted = '';
  if (num >= 10000000) {
    formatted = `₹ ${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    formatted = `₹ ${(num / 100000).toFixed(2)} L`;
  } else {
    formatted = `₹ ${num.toLocaleString('en-IN')}`;
  }

  if (listingType === 'rent' || unit === 'per_month') {
    return `${formatted} / mo`;
  }
  return formatted;
};

const PropertyCard = ({ property, onFavoriteToggle, onContactClick }) => {
  const { isAuthenticated, agency } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(property.is_favorited || false);
  const [loadingFav, setLoadingFav] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoadingFav(true);
      const res = await propertyService.toggleFavorite(property.id);
      if (res.success) {
        setIsFavorited(res.isFavorited);
        showToast(res.isFavorited ? 'Added to favorites!' : 'Removed from favorites.', 'info');
        if (onFavoriteToggle) onFavoriteToggle(property.id, res.isFavorited);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    } finally {
      setLoadingFav(false);
    }
  };

  const primaryImage =
    property.primary_image ||
    (property.images && property.images.length > 0
      ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].image_url)
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80');

  // WhatsApp & Phone formatting with live agency profile fallback
  const cardPhone = property.agent_phone || agency?.phone || '+91 98470 12345';
  const cardWhatsapp = property.agent_whatsapp || agency?.whatsapp || agency?.phone || '+91 98470 12345';
  let cleanDigits = cardWhatsapp.replace(/[^0-9]/g, '');
  if (cleanDigits.length === 10) cleanDigits = '91' + cleanDigits;
  
  const whatsappUrl = `https://wa.me/${cleanDigits}?text=${encodeURIComponent(
    `Hello, I am interested in "${property.title}" (${property.ref_number || 'Listing'}) listed at ${formatPrice(property.price, property.price_unit, property.listing_type)} in ${property.city}. Please share details.`
  )}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col">
      
      {/* Image Container with Badges & Favorite */}
      <Link to={`/properties/${property.id}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm ${
              property.listing_type === 'rent'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            For {property.listing_type}
          </span>

          {property.is_featured && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}

          <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-xs">
            {property.property_type_name || 'Property'}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={loadingFav}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorited
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 hover:bg-white text-slate-700 hover:text-red-500'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Image Stats (Price on image) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
          <div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-md">
              {formatPrice(property.price, property.price_unit, property.listing_type)}
            </div>
            <div className="text-[11px] text-slate-200 drop-shadow-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-300" />
              <span className="truncate max-w-[200px]">{property.locality ? `${property.locality}, ` : ''}{property.city}</span>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
            <Eye className="w-3 h-3" />
            <span>{property.views_count || 0}</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/properties/${property.id}`} className="block">
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-base leading-snug">
              {property.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Key Attributes Bar */}
        <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 text-slate-700 text-xs font-medium">
          {property.bedrooms > 0 ? (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-brand-600" />
              <span>{property.bedrooms} Beds</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Plot/Land</span>
            </div>
          )}

          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-brand-600" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-brand-600" />
            <span>
              {property.built_up_area > 0
                ? `${property.built_up_area} sqft`
                : `${property.land_area} sqft`}
            </span>
          </div>
        </div>

        {/* Footer: Direct WhatsApp & Call Buttons + Details */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          
          {/* Agent info row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={property.agent_avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'}
                alt={property.agent_name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1 truncate">
                  {property.agency_name || property.agent_name || 'DARV Real Estate'}
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />
                </p>
                <p className="text-[10px] text-slate-400 truncate">Direct Developer</p>
              </div>
            </div>

            <Link
              to={`/properties/${property.id}`}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Direct Action Buttons: WhatsApp & Call */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
              title="Chat directly on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${cardPhone.replace(/[^0-9]/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
              title={`Call ${cardPhone}`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PropertyCard;
