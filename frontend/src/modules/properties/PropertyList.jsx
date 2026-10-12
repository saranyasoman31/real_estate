import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { propertyService, masterDataService } from '../../services/api';
import PropertyCard from '../../components/PropertyCard';
import EnquiryModal from '../../components/EnquiryModal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  Sparkles
} from 'lucide-react';

const PropertyList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [locations, setLocations] = useState({ cities: [] });
  const [selectedPropForContact, setSelectedPropForContact] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filter state synced with searchParams
  const keyword = searchParams.get('keyword') || '';
  const listing_type = searchParams.get('listing_type') || 'all';
  const type = searchParams.get('type') || 'all';
  const city = searchParams.get('city') || 'All Cities';
  const bedrooms = searchParams.get('bedrooms') || 'all';
  const furnishing = searchParams.get('furnishing') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const min_price = searchParams.get('min_price') || '';
  const max_price = searchParams.get('max_price') || '';
  const is_featured = searchParams.get('is_featured') === 'true';

  useEffect(() => {
    // Load master data once
    const loadMaster = async () => {
      try {
        const [types, locs] = await Promise.all([
          masterDataService.getPropertyTypes(),
          masterDataService.getLocations()
        ]);
        if (types.success) setPropertyTypes(types.data);
        if (locs.success) setLocations(locs);
      } catch (e) {
        console.error('Master data load failed:', e);
      }
    };
    loadMaster();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = {};
      if (keyword) params.keyword = keyword;
      if (listing_type && listing_type !== 'all') params.listing_type = listing_type;
      if (type && type !== 'all') params.type = type;
      if (city && city !== 'All Cities') params.city = city;
      if (bedrooms && bedrooms !== 'all') params.bedrooms = bedrooms;
      if (furnishing && furnishing !== 'all') params.furnishing = furnishing;
      if (min_price) params.min_price = min_price;
      if (max_price) params.max_price = max_price;
      if (is_featured) params.is_featured = 'true';
      params.sort = sort;
      params.page = page;
      params.limit = 12;

      const res = await propertyService.getProperties(params);
      if (res.success) {
        setProperties(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'All Cities' && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {city && city !== 'All Cities' ? `Properties in ${city}` : 'Discover Real Estate Properties'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {total} verified residential and commercial listings
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search location or keyword..."
                value={keyword}
                onChange={(e) => updateParam('keyword', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(keyword || listing_type !== 'all' || type !== 'all' || city !== 'All Cities' || bedrooms !== 'all' || is_featured || min_price || max_price) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
            {city !== 'All Cities' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
                City: {city}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('city', 'All Cities')} />
              </span>
            )}
            {listing_type !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200 capitalize">
                For {listing_type}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('listing_type', 'all')} />
              </span>
            )}
            {type !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200 capitalize">
                Type: {type}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('type', 'all')} />
              </span>
            )}
            {bedrooms !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
                {bedrooms} BHK
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('bedrooms', 'all')} />
              </span>
            )}
            {is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                Featured Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('is_featured', '')} />
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:underline font-semibold ml-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}

        {/* Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}>
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm sticky top-24 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <h3 className="font-bold text-sm text-slate-900">Refine Search</h3>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  Reset
                </button>
              </div>

              {/* 1. Listing Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Listing Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['all', 'sale', 'rent'].map((lt) => (
                    <button
                      key={lt}
                      onClick={() => updateParam('listing_type', lt)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize border transition ${
                        listing_type === lt
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. City Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  City / Location
                </label>
                <select
                  value={city}
                  onChange={(e) => updateParam('city', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="All Cities">All Cities</option>
                  <option value="Trivandrum">Trivandrum</option>
                </select>
              </div>

              {/* 3. Property Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Property Category
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="property_type"
                      checked={type === 'all'}
                      onChange={() => updateParam('type', 'all')}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>All Property Types</span>
                  </label>
                  {propertyTypes.map((pt) => (
                    <label key={pt.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="property_type"
                        checked={type === pt.slug}
                        onChange={() => updateParam('type', pt.slug)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>{pt.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Bedrooms (BHK) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Bedrooms (BHK)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['all', '1', '2', '3', '4'].map((b) => (
                    <button
                      key={b}
                      onClick={() => updateParam('bedrooms', b)}
                      className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                        bedrooms === b
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b === 'all' ? 'Any' : b === '4' ? '4+' : `${b}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Furnishing Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Furnishing
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => updateParam('furnishing', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="all">Any Furnishing</option>
                  <option value="fully-furnished">Fully Furnished</option>
                  <option value="semi-furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* 6. Featured Only Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={is_featured}
                    onChange={(e) => updateParam('is_featured', e.target.checked ? 'true' : '')}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                  />
                  <span>Show Featured Only</span>
                </label>
              </div>

            </div>
          </div>

          {/* Properties Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No properties matched your criteria</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Try adjusting your budget, selecting "All Cities", or clearing active filters to browse available listings.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onContactClick={(p) => setSelectedPropForContact(p)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateParam('page', Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateParam('page', p)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold border transition ${
                          page === p
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => updateParam('page', Math.min(totalPages, page + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Enquiry Modal */}
      {selectedPropForContact && (
        <EnquiryModal
          property={selectedPropForContact}
          isOpen={!!selectedPropForContact}
          onClose={() => setSelectedPropForContact(null)}
        />
      )}
    </div>
  );
};

export default PropertyList;
