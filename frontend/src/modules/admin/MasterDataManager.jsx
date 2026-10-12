import React, { useState, useEffect } from 'react';
import { masterDataService } from '../../services/api';
import {
  Layers,
  Plus,
  Trash2,
  Building,
  CheckCircle,
  MapPin,
  Tag
} from 'lucide-react';

const MasterDataManager = () => {
  const [activeTab, setActiveTab] = useState('types'); // 'types' | 'amenities' | 'cities'
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [locations, setLocations] = useState({ states: [], cities: [] });
  const [loading, setLoading] = useState(true);

  // Form states
  const [newType, setNewType] = useState({ name: '', slug: '', description: '' });
  const [newAmenity, setNewAmenity] = useState({ name: '', category: 'general' });
  const [newCity, setNewCity] = useState({ name: '', state_id: '1', image_url: '', is_popular: true });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, aRes, lRes] = await Promise.all([
        masterDataService.getPropertyTypes(),
        masterDataService.getAmenities(),
        masterDataService.getLocations()
      ]);
      if (tRes.success) setPropertyTypes(tRes.data);
      if (aRes.success) setAmenities(aRes.data);
      if (lRes.success) setLocations(lRes);
    } catch (err) {
      console.error('Failed to load master data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    if (!newType.name) return;
    try {
      const res = await masterDataService.createPropertyType(newType);
      if (res.success) {
        setPropertyTypes([...propertyTypes, res.data]);
        setNewType({ name: '', slug: '', description: '' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAmenity = async (e) => {
    e.preventDefault();
    if (!newAmenity.name) return;
    try {
      const res = await masterDataService.createAmenity(newAmenity);
      if (res.success) {
        setAmenities([...amenities, res.data]);
        setNewAmenity({ name: '', category: 'general' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCity = async (e) => {
    e.preventDefault();
    if (!newCity.name) return;
    try {
      const res = await masterDataService.createCity(newCity);
      if (res.success) {
        loadData();
        setNewCity({ name: '', state_id: '1', image_url: '', is_popular: true });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteItem = async (entity, id) => {
    if (!window.confirm(`Delete this ${entity} entry?`)) return;
    try {
      const res = await masterDataService.deleteItem(entity, id);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 uppercase tracking-wider">
            SRS v1.0 Section 7.5
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Master Data Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure system categories, amenities tags, states, and metro locations.
          </p>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pb-3">
            {[
              { id: 'types', label: 'Property Types', count: propertyTypes.length },
              { id: 'amenities', label: 'Amenities & Badges', count: amenities.length },
              { id: 'cities', label: 'Cities & Regions', count: locations.cities?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Property Types */}
        {activeTab === 'types' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Add Property Type</h3>
              <form onSubmit={handleCreateType} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farmhouse"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. farmhouse"
                    value={newType.slug}
                    onChange={(e) => setNewType({ ...newType, slug: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Description of category..."
                    value={newType.description}
                    onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              {propertyTypes.map((pt) => (
                <div key={pt.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{pt.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">slug: <code className="bg-slate-100 px-1 rounded">{pt.slug}</code> • {pt.property_count || 0} listings</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('property_types', pt.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Amenities */}
        {activeTab === 'amenities' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Add New Amenity</h3>
              <form onSubmit={handleCreateAmenity} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amenity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Squash Court"
                    value={newAmenity.name}
                    onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newAmenity.category}
                    onChange={(e) => setNewAmenity({ ...newAmenity, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  >
                    <option value="leisure">Leisure</option>
                    <option value="wellness">Wellness</option>
                    <option value="security">Security</option>
                    <option value="utility">Utility</option>
                    <option value="community">Community</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Amenity
                </button>
              </form>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {amenities.map((a) => (
                <div key={a.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{a.name}</h5>
                    <span className="text-[10px] text-slate-400 capitalize">{a.category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('amenities', a.id)}
                    className="p-1 text-slate-300 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Cities */}
        {activeTab === 'cities' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Add City Location</h3>
              <form onSubmit={handleCreateCity} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={newCity.state_id}
                    onChange={(e) => setNewCity({ ...newCity, state_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  >
                    {locations.states?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad"
                    value={newCity.name}
                    onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Card Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newCity.image_url}
                    onChange={(e) => setNewCity({ ...newCity, image_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add City
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              {locations.cities?.map((c) => (
                <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-400">{c.state_name} • {c.property_count || 0} listings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('cities', c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MasterDataManager;
