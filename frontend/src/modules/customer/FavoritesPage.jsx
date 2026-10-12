import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard';
import EnquiryModal from '../../components/EnquiryModal';
import { Heart, Search, ArrowRight } from 'lucide-react';

const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropForContact, setSelectedPropForContact] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getFavorites();
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (propId, isFav) => {
    if (!isFav) {
      setFavorites(prev => prev.filter(p => p.id !== propId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-current" />
              <span>Saved Properties Collection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Your Favorite Homes ({favorites.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Keep track of properties you like and compare specifications before contacting agents.
            </p>
          </div>
          <Link
            to="/properties"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            <span>Explore more homes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Saved Properties Yet</h3>
            <p className="text-xs text-slate-500">
              When browsing homes, click the heart icon on any card to save it here for instant review.
            </p>
            <Link
              to="/properties"
              className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={{ ...prop, is_favorited: true }}
                onFavoriteToggle={handleFavoriteToggle}
                onContactClick={(p) => setSelectedPropForContact(p)}
              />
            ))}
          </div>
        )}

      </div>

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

export default FavoritesPage;
