import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, IndianRupee, ArrowRight } from 'lucide-react';

const SearchBar = ({ initialValues = {}, className = '' }) => {
  const navigate = useNavigate();

  const [listingType, setListingType] = useState(initialValues.listing_type || 'sale');
  const [city, setCity] = useState(initialValues.city || 'All Cities');
  const [propertyType, setPropertyType] = useState(initialValues.type || 'all');
  const [priceBudget, setPriceBudget] = useState(initialValues.price || 'all');
  const [keyword, setKeyword] = useState(initialValues.keyword || '');

  const handleSearch = (e) => {
    e?.preventDefault();

    const params = new URLSearchParams();
    if (listingType) params.append('listing_type', listingType);
    if (city && city !== 'All Cities') params.append('city', city);
    if (propertyType && propertyType !== 'all') params.append('type', propertyType);
    if (keyword.trim()) params.append('keyword', keyword.trim());

    if (priceBudget === 'under_50l') {
      params.append('max_price', '5000000');
    } else if (priceBudget === '50l_1cr') {
      params.append('min_price', '5000000');
      params.append('max_price', '10000000');
    } else if (priceBudget === '1cr_5cr') {
      params.append('min_price', '10000000');
      params.append('max_price', '50000000');
    } else if (priceBudget === 'above_5cr') {
      params.append('min_price', '50000000');
    }

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      
      {/* Top Listing Type Tabs (Buy / Rent / Commercial) */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setListingType('sale')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
            listingType === 'sale'
              ? 'bg-brand-600 text-white shadow-brand-500/25'
              : 'bg-white/90 hover:bg-white text-slate-700 backdrop-blur-md'
          }`}
        >
          Buy Properties
        </button>
        <button
          type="button"
          onClick={() => setListingType('rent')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
            listingType === 'rent'
              ? 'bg-blue-600 text-white shadow-blue-500/25'
              : 'bg-white/90 hover:bg-white text-slate-700 backdrop-blur-md'
          }`}
        >
          Rent Properties
        </button>
      </div>

      {/* Main Search Filter Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-slate-200/80 backdrop-blur-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
      >
        {/* 1. Location / City */}
        <div className="lg:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              City / Region
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer truncate"
            >
              <option value="All Cities">All Locations</option>
              <option value="Trivandrum">Trivandrum, Kerala</option>
            </select>
          </div>
        </div>

        {/* 2. Property Type */}
        <div className="lg:col-span-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">All Categories</option>
              <option value="apartment">Apartments / Flats</option>
              <option value="villa">Luxury Villas</option>
              <option value="house">Independent Houses</option>
              <option value="plot">Plots / Land</option>
              <option value="commercial">Commercial Spaces</option>
            </select>
          </div>
        </div>

        {/* 3. Budget Range */}
        <div className="lg:col-span-3 px-3 py-2 border-b lg:border-b-0 lg:border-r border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Budget Range
            </label>
            <select
              value={priceBudget}
              onChange={(e) => setPriceBudget(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">Any Budget</option>
              <option value="under_50l">Under ₹ 50 Lakhs</option>
              <option value="50l_1cr">₹ 50 Lakhs - 1 Crore</option>
              <option value="1cr_5cr">₹ 1 Cr - 5 Crores</option>
              <option value="above_5cr">Ultra Luxury (&gt; ₹ 5 Cr)</option>
            </select>
          </div>
        </div>

        {/* 4. Keyword / Search Button */}
        <div className="lg:col-span-3 flex items-center gap-2 pl-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. Worli, Sea face, Pool"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium placeholder-slate-400 text-slate-800"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/30 flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SearchBar;
