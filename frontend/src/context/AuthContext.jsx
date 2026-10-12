import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, agentService } from '../services/api';
import { getAssetUrl } from '../utils/paths';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rem_token') || null);
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState({
    name: 'Saranya Soman',
    logo: getAssetUrl('/images/darv-logo.png'),
    phone: '+91 6282649279',
    whatsapp: '+916282649279',
    email: 'saranyasoman31@gmail.com',
    website: 'https://www.darvproperties.com',
    address: 'DARV Tower, Kowdiar Main Road, Trivandrum, Kerala - 695003',
    agency_name: 'DARV Real Estate & Construction',
    tagline: 'Dreams Architecture Realty Value'
  });

  const fetchPrimaryAgency = async () => {
    try {
      const res = await agentService.getPrimaryAgent();
      if (res.success && res.data) {
        const data = res.data;
        if (data.logo) data.logo = getAssetUrl(data.logo);
        if (data.logo_url) data.logo_url = getAssetUrl(data.logo_url);
        setAgency(data);
      }
    } catch (e) {
      console.warn('Could not fetch primary agency details, using defaults.');
    }
  };

  useEffect(() => {
    fetchPrimaryAgency();
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.user);
          }
        } catch (err) {
          console.error('Failed to load user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('rem_token', res.token);
      setToken(res.token);
      setUser(res.user);
      fetchPrimaryAgency();
      return res.user;
    }
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    if (res.success && res.token) {
      localStorage.setItem('rem_token', res.token);
      setToken(res.token);
      setUser(res.user);
      fetchPrimaryAgency();
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('rem_token');
    setToken(null);
    setUser(null);
  };

  const refreshAgency = () => {
    return fetchPrimaryAgency();
  };

  const isClient = user && ['client', 'admin', 'super_admin'].includes(user.role);
  const isCustomer = user && user.role === 'customer';

  // Helper formatting for redirection
  const cleanPhone = (agency?.phone || '+91 98470 12345').replace(/[^0-9]/g, '');
  const cleanWhatsapp = (agency?.whatsapp || agency?.phone || '+91 98470 12345').replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanWhatsapp.length === 10 ? '91' + cleanWhatsapp : cleanWhatsapp;

  const getCallUrl = (overridePhone) => {
    const p = overridePhone || agency?.phone || '+91 98470 12345';
    return `tel:${p}`;
  };

  const getWhatsappUrl = (messageText, overrideWhatsapp) => {
    let w = (overrideWhatsapp || formattedWhatsapp || '919847012345').replace(/[^0-9]/g, '');
    if (w.length === 10) w = '91' + w;
    const defaultText = `Hello ${agency?.name || 'Saranya'}, I am contacting you regarding property listings in Trivandrum.`;
    return `https://wa.me/${w}?text=${encodeURIComponent(messageText || defaultText)}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        agency,
        refreshAgency,
        getCallUrl,
        getWhatsappUrl,
        isAuthenticated: !!user,
        isClient,
        isCustomer,
        isAgent: isClient, // Backward compatibility alias
        isAdmin: isClient,  // Backward compatibility alias
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
