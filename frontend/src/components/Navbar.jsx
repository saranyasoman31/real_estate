import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { showConfirmDialog, showToast } from '../utils/alerts';
import {
  Building2,
  Heart,
  Bell,
  User,
  PlusCircle,
  LayoutDashboard,
  Menu,
  X,
  MapPin,
  ChevronDown,
  LogOut,
  FileText,
  Briefcase,
  Settings,
  Star
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isClient, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedCity, setSelectedCity] = useState('All Cities');

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Brand Logo & City Picker */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group py-1">
              <img
                src="/images/darv-logo.png"
                alt="DARV Real Estate & Construction"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            {/* City Quick Picker */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 cursor-pointer transition">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  navigate(`/properties?city=${encodeURIComponent(e.target.value)}`);
                }}
                className="bg-transparent border-none outline-none cursor-pointer pr-1 text-slate-800 font-semibold"
              >
                <option value="All Cities">All Cities</option>
                <option value="Trivandrum">Trivandrum</option>
              </select>
            </div>
          </div>

          {/* Center: Main Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/properties?listing_type=sale"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.search.includes('listing_type=sale')
                  ? 'text-brand-600 bg-brand-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Buy Homes
            </Link>
            <Link
              to="/properties?listing_type=rent"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.search.includes('listing_type=rent')
                  ? 'text-brand-600 bg-brand-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rent Homes
            </Link>
            <Link
              to="/properties?type=commercial"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              Commercial
            </Link>
            <Link
              to="/properties?type=plot"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              Plots & Land
            </Link>
            <Link
              to="/properties"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              All Listings
            </Link>
          </nav>

          {/* Right: Actions & User Menu */}
          <div className="flex items-center gap-3">
            

            {/* Client Owner "+ Add Property" button */}
            {isClient && (
              <Link
                to="/client/properties/add"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs hover:shadow transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Property</span>
              </Link>
            )}

            {/* Saved Homes / Favorites */}
            <Link
              to="/favorites"
              className="p-2 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-50 transition relative"
              title="Saved Favorites"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Notifications Menu */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-900">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-600 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs hover:bg-slate-50 cursor-pointer ${
                              !n.is_read ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => {
                              if (n.link) navigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                          >
                            <div className="font-semibold text-slate-800">{n.title}</div>
                            <div className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Menu or Sign In */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-slate-300 transition hover:shadow-xs"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-brand-500/30"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700">
                        {isClient ? 'Property Owner / Client' : 'Customer'}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      {isClient && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-600" />
                            Agent Dashboard
                          </Link>
                          <Link
                            to="/admin/properties"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Building2 className="w-4 h-4 text-slate-500" />
                            Manage Inventory
                          </Link>
                          <Link
                            to="/admin/properties/add"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 text-emerald-600 font-semibold"
                          >
                            <PlusCircle className="w-4 h-4 text-emerald-600" />
                            Upload Property
                          </Link>
                          <Link
                            to="/admin/inquiries"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-4 h-4 text-brand-600" />
                            Customer Requests & CRM
                          </Link>
                          <Link
                            to="/admin/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 text-brand-700 font-semibold"
                          >
                            <Settings className="w-4 h-4 text-brand-600" />
                            Agent Profile & Contact Settings
                          </Link>
                          <Link
                            to="/admin/feedback"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 text-amber-700 font-semibold"
                          >
                            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                            Customer Feedback & Trust Score
                          </Link>
                        </>
                      )}

                      {!isClient && (
                        <>
                          <Link
                            to="/favorites"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <Heart className="w-4 h-4 text-red-500" />
                            Saved Properties
                          </Link>
                          <Link
                            to="/my/enquiries"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            My Inquiries
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            Account Settings
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirmDialog({
                            title: 'Sign Out?',
                            text: 'Do you want to log out of your session?',
                            confirmButtonText: 'Yes, Sign Out'
                          });
                          if (confirmed) {
                            logout();
                            showToast('Signed out successfully', 'info');
                            setProfileDropdownOpen(false);
                            navigate('/');
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-300 text-xs font-bold text-slate-700 hover:text-brand-600 bg-slate-50 transition"
                  title="Agent & Property Management Portal"
                >
                  <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                  <span>Agent Portal</span>
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xs hover:shadow transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 text-sm">
            <Link
              to="/properties?listing_type=sale"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 text-center font-medium text-slate-800"
            >
              Buy Homes
            </Link>
            <Link
              to="/properties?listing_type=rent"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 text-center font-medium text-slate-800"
            >
              Rent Homes
            </Link>
            <Link
              to="/properties?type=commercial"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 text-center font-medium text-slate-800"
            >
              Commercial
            </Link>
            <Link
              to="/properties?type=plot"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 text-center font-medium text-slate-800"
            >
              Plots
            </Link>
          </div>

          {isClient && (
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Owner Controls</p>
              <Link
                to="/client/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
              >
                Owner Dashboard
              </Link>
              <Link
                to="/client/properties/add"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-emerald-600 font-semibold hover:bg-emerald-50"
              >
                + Upload New Property
              </Link>
              <Link
                to="/client/inquiries"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
              >
                Customer Leads CRM
              </Link>
              <Link
                to="/admin/feedback"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-amber-700 font-semibold hover:bg-amber-50"
              >
                Customer Feedback & Trust Score
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
