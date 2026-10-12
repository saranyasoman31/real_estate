import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agentService } from '../../services/api';
import {
  CheckCircle2,
  MapPin,
  Star,
  Award,
  Building,
  Phone,
  MessageCircle,
  Search,
  Briefcase
} from 'lucide-react';

const AgentsDirectory = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchAgents();
  }, [city]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await agentService.getAgents({ city, search });
      if (res.success) {
        setAgents(res.data);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAgents();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>RERA Registered Realtor Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Connect With Certified Real Estate Agents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every agent on our network is KYC-verified with authenticated license numbers and documented sales history.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3 w-full">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search agent by name or firm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="">All Cities</option>
              <option value="Trivandrum">Trivandrum</option>
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-64 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No agents found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the city or name search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => {
              const cleanPhone = (agent.phone || '').replace(/[^0-9]/g, '');
              return (
                <div
                  key={agent.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start gap-4">
                      <img
                        src={agent.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
                        alt={agent.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-base truncate">{agent.name}</h3>
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" title="RERA Verified" />
                        </div>
                        <p className="text-xs font-semibold text-brand-600 truncate">{agent.agency_name}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{agent.rating || '5.0'}</span>
                          <span className="text-slate-400 font-normal ml-1">({agent.total_sales || 10}+ Deals)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed">
                      {agent.bio || 'Professional real estate advisor dedicated to finding your ideal residence or high-yield commercial investment.'}
                    </p>

                    {/* Meta stats bar */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Experience</span>
                        <strong className="text-slate-800 font-bold">{agent.experience_years || 5} Years</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Active Listings</span>
                        <strong className="text-slate-800 font-bold">{agent.active_listings_count || 0} Properties</strong>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{agent.operating_cities || 'Trivandrum'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/properties?keyword=${encodeURIComponent(agent.name)}`}
                      className="flex-1 py-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white text-center text-xs font-bold transition"
                    >
                      View Listings
                    </Link>

                    {agent.phone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
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

export default AgentsDirectory;
