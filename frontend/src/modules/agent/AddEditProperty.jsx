import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { propertyService, masterDataService } from '../../services/api';
import { showAlertSuccess, showAlertError, showConfirmDialog, showToast } from '../../utils/alerts';
import {
  Building2,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  FileUp,
  X
} from 'lucide-react';

const AddEditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State - Clean empty initial state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type_id: '',
    listing_type: 'sale',
    price: '',
    price_unit: 'total',
    land_area: '',
    built_up_area: '',
    bedrooms: '',
    bathrooms: '',
    parking_spaces: '',
    floor_no: '',
    total_floors: '',
    furnishing_status: '',
    facing: '',
    year_built: '',
    address: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    video_url: '',
    contact_preference: 'all',
    status: 'published'
  });

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const loadMasterAndProperty = async () => {
      try {
        setLoading(true);
        const [types, amenities] = await Promise.all([
          masterDataService.getPropertyTypes(),
          masterDataService.getAmenities()
        ]);
        if (types.success) setPropertyTypes(types.data);
        if (amenities.success) setAmenitiesList(amenities.data);

        // Fetch existing property details if in edit mode
        if (id) {
          const propRes = await propertyService.getPropertyById(id);
          if (propRes.success && propRes.data) {
            const p = propRes.data;
            setFormData({
              title: p.title || '',
              description: p.description || '',
              property_type_id: p.property_type_id ? String(p.property_type_id) : '',
              listing_type: p.listing_type || 'sale',
              price: p.price !== null && p.price !== undefined ? String(p.price) : '',
              price_unit: p.price_unit || 'total',
              land_area: p.land_area !== null && p.land_area !== undefined ? String(p.land_area) : '',
              built_up_area: p.built_up_area !== null && p.built_up_area !== undefined ? String(p.built_up_area) : '',
              bedrooms: p.bedrooms !== null && p.bedrooms !== undefined ? String(p.bedrooms) : '',
              bathrooms: p.bathrooms !== null && p.bathrooms !== undefined ? String(p.bathrooms) : '',
              parking_spaces: p.parking_spaces !== null && p.parking_spaces !== undefined ? String(p.parking_spaces) : '',
              floor_no: p.floor_no !== null && p.floor_no !== undefined ? String(p.floor_no) : '',
              total_floors: p.total_floors !== null && p.total_floors !== undefined ? String(p.total_floors) : '',
              furnishing_status: p.furnishing_status || '',
              facing: p.facing || '',
              year_built: p.year_built !== null && p.year_built !== undefined ? String(p.year_built) : '',
              address: p.address || '',
              locality: p.locality || '',
              city: p.city || '',
              state: p.state || '',
              pincode: p.pincode || '',
              latitude: p.latitude !== null && p.latitude !== undefined ? String(p.latitude) : '',
              longitude: p.longitude !== null && p.longitude !== undefined ? String(p.longitude) : '',
              video_url: p.video_url || '',
              contact_preference: p.contact_preference || 'all',
              status: p.status || 'published'
            });

            if (Array.isArray(p.images) && p.images.length > 0) {
              setImages(p.images.map(img => ({
                url: img.image_url || img.url,
                is_primary: Boolean(img.is_primary)
              })));
            }

            if (Array.isArray(p.amenities) && p.amenities.length > 0) {
              setSelectedAmenities(p.amenities.map(a => a.id));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load property data:', e);
        showAlertError('Load Error', 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    loadMasterAndProperty();
  }, [id]);

  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId) ? prev.filter(id => id !== amenityId) : [...prev, amenityId]
    );
  };

  // Add image by URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) {
      showToast('Please enter an image URL', 'warning');
      return;
    }
    setImages(prev => [...prev, { url: newImageUrl.trim(), is_primary: prev.length === 0 }]);
    setNewImageUrl('');
    showToast('Image URL added to gallery', 'success');
  };

  // Add image by local file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlertError('Invalid File', 'Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    try {
      setUploadingImage(true);
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await propertyService.uploadImage(uploadData);
      if (res.success && res.url) {
        setImages(prev => [...prev, { url: res.url, is_primary: prev.length === 0 }]);
        showToast('Photo uploaded successfully!', 'success');
      }
    } catch (err) {
      showAlertError('Upload Failed', err.response?.data?.message || err.message || 'Could not upload photo.');
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    showToast('Photo removed', 'info');
  };

  const handleSetPrimaryImage = (index) => {
    setImages(prev =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    );
    showToast('Cover photo updated', 'success');
  };

  const handleSubmit = async (isDraft) => {
    // Validation
    if (!formData.title.trim()) {
      showAlertError('Missing Title', 'Please enter a property title.');
      return;
    }
    if (!formData.price) {
      showAlertError('Missing Price', 'Please enter the property price.');
      return;
    }
    if (!formData.property_type_id) {
      showAlertError('Select Property Type', 'Please choose a property type (Apartment, Villa, etc.).');
      return;
    }
    if (!formData.city.trim() || !formData.address.trim()) {
      showAlertError('Missing Location', 'Please provide the city and street address.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        is_draft: isDraft,
        images: images.map((img, idx) => ({
          url: img.url,
          is_primary: img.is_primary || (idx === 0)
        })),
        amenities: selectedAmenities
      };

      if (isEdit) {
        const res = await propertyService.updateProperty(id, payload);
        if (res.success) {
          await showAlertSuccess('Property Updated!', 'The property details have been saved successfully.');
          navigate('/admin/properties');
        }
      } else {
        const res = await propertyService.createProperty(payload);
        if (res.success) {
          if (isDraft) {
            await showAlertSuccess('Draft Saved', 'Property saved as draft in your inventory.');
          } else {
            await showAlertSuccess('Property Live!', 'Property has been published directly to the customer marketplace.');
          }
          navigate('/admin/properties');
        }
      }
    } catch (err) {
      showAlertError('Save Error', err.response?.data?.message || err.message || 'Failed to save property listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header with Back button */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Property Inventory</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isEdit ? 'Edit Property Details' : 'Upload New Property Listing'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isEdit ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-brand-50 text-brand-700 border border-brand-200'
              }`}>
                {isEdit ? 'Edit Mode' : 'Direct Agent Upload'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isEdit
                ? 'Update specifications, pricing, location, amenities or photos. Changes reflect immediately on the marketplace.'
                : 'Enter complete details of the property. Published properties appear instantly on the public customer marketplace.'}
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Property Details</h3>

              {isEdit && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-950 mb-0.5">Listing Status</label>
                    <p className="text-[11px] text-amber-700">Change availability status across the marketplace.</p>
                  </div>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
                  >
                    <option value="published">Live & Available</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sea-Facing 4 BHK Ultra Luxury Penthouse at Worli Sea Face"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide property specifications, view, nearby landmarks, quality of fixtures, society highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Category *</label>
                  <select
                    value={formData.property_type_id}
                    onChange={(e) => setFormData({ ...formData, property_type_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="">-- Select Property Type --</option>
                    {propertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Listing Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listing_type: 'sale' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        formData.listing_type === 'sale'
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, listing_type: 'rent' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        formData.listing_type === 'rent'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      For Rent
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Dimensions */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Pricing & Dimensions</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000000 (1.5 Cr)"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Unit</label>
                  <select
                    value={formData.price_unit}
                    onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="total">Total Value (Default)</option>
                    <option value="per_month">Per Month (Rent)</option>
                    <option value="per_sqft">Per Sq.ft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Built-Up Area (sq.ft)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1850"
                    value={formData.built_up_area}
                    onChange={(e) => setFormData({ ...formData, built_up_area: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms</label>
                  <select
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <option value="">Select Beds</option>
                    <option value="0">0 (Plot / Studio)</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                  <select
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <option value="">Select Baths</option>
                    <option value="1">1 Bath</option>
                    <option value="2">2 Baths</option>
                    <option value="3">3 Baths</option>
                    <option value="4">4 Baths</option>
                    <option value="5">5+ Baths</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parking</label>
                  <select
                    value={formData.parking_spaces}
                    onChange={(e) => setFormData({ ...formData, parking_spaces: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <option value="">Select Parking</option>
                    <option value="0">None</option>
                    <option value="1">1 Covered</option>
                    <option value="2">2 Covered</option>
                    <option value="3">3+ Spaces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Furnishing</label>
                  <select
                    value={formData.furnishing_status}
                    onChange={(e) => setFormData({ ...formData, furnishing_status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <option value="">Select Furnishing</option>
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi Furnished</option>
                    <option value="fully-furnished">Fully Furnished</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor Placement</label>
                  <input
                    type="number"
                    placeholder="e.g. 14"
                    value={formData.floor_no}
                    onChange={(e) => setFormData({ ...formData, floor_no: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Floors</label>
                  <input
                    type="number"
                    placeholder="e.g. 28"
                    value={formData.total_floors}
                    onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facing</label>
                  <select
                    value={formData.facing}
                    onChange={(e) => setFormData({ ...formData, facing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <option value="">Select Facing</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="North-East">North-East</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year Built</label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    value={formData.year_built}
                    onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Location */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Location & Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trivandrum"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Kowdiar, Kazhakkoottam, Pattom"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Kerala"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 1402, Tower 3, Prestige Palms, Marina Drive"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 400050"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Amenities Checklist */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Select Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs font-semibold ${
                      selectedAmenities.includes(amenity.id)
                        ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      className="text-brand-600 rounded"
                    />
                    <span>{amenity.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 5: Media & Photo Gallery */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">5. Property Photos & Media</h3>

              {/* Upload controls: File Upload + URL Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Direct file upload */}
                <label className={`p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/30 flex items-center justify-center gap-2.5 cursor-pointer transition ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                  <FileUp className="w-5 h-5 text-brand-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {uploadingImage ? 'Uploading Image...' : 'Upload Image File (JPG/PNG)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* 2. Image URL entry */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Photos Preview Grid */}
              {images.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No photos added yet. Upload local images or paste image URLs above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold transition shadow ${
                          img.is_primary || (idx === 0 && !images.some(i => i.is_primary))
                            ? 'bg-brand-600 text-white'
                            : 'bg-black/60 hover:bg-black text-white/80'
                        }`}
                      >
                        {img.is_primary || (idx === 0 && !images.some(i => i.is_primary)) ? 'Cover Photo' : 'Make Cover'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* YouTube Video Tour Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Video Tour Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
              {isEdit ? (
                <>
                  <Link
                    to="/admin/properties"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition text-center"
                  >
                    Cancel
                  </Link>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSubmit(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{saving ? 'Saving Changes...' : 'Save & Update Property'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSubmit(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSubmit(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{saving ? 'Publishing...' : 'Publish Property Now'}</span>
                  </button>
                </>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AddEditProperty;
