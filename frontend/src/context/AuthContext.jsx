import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, agentService } from '../services/api';
import { getAssetUrl } from '../utils/paths';
import { DEMO_AGENCY, DEMO_USER } from '../services/demoData';

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
      if (res && res.success && res.data) {
        const data = { ...res.data };
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
        // If logged in via demo token, instantly restore demo user
        if (token.startsWith('demo-jwt-')) {
          setUser({
            ...DEMO_USER,
            avatar_url: getAssetUrl('/images/darv-icon.png')
          });
          setLoading(false);
          return;
        }

        try {
          const res = await authService.getMe();
          if (res && res.success && res.user) {
            setUser(res.user);
          } else {
            // Fallback for static hosting sessions
            setUser({
              ...DEMO_USER,
              avatar_url: getAssetUrl('/images/darv-icon.png')
            });
          }
        } catch (err) {
          console.warn('Profile fetch error, checking token validity:', err);
          // Only force logout if the backend explicitly threw an unauthorized 401
          if (err.message && (err.message.includes('401') || err.message.includes('expired'))) {
            logout();
          } else {
            // Static hosting or network glitch: keep session alive
            setUser({
              ...DEMO_USER,
              avatar_url: getAssetUrl('/images/darv-icon.png')
            });
          }
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (identifier, password) => {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    // 1. Attempt backend authentication
    try {
      const res = await authService.login({ email: cleanId, password: cleanPass });
      if (res && res.success && res.token) {
        localStorage.setItem('rem_token', res.token);
        setToken(res.token);
        setUser(res.user);
        fetchPrimaryAgency();
        // Return object with both success and user properties for universal compatibility
        return {
          success: true,
          user: res.user,
          ...res.user
        };
      }
    } catch (err) {
      console.warn('Remote backend authentication unavailable or failed, checking demo credentials:', err.message);
    }

    // 2. Demo / Static Hosting Credentials Check
    const lowerId = cleanId.toLowerCase();
    const validUsernames = ['darvproperties.com', 'saranyasoman31@gmail.com', 'admin@darvproperties.com'];
    if (validUsernames.includes(lowerId) && cleanPass === '123456') {
      const demoUser = {
        ...DEMO_USER,
        email: lowerId === 'saranyasoman31@gmail.com' ? 'saranyasoman31@gmail.com' : 'darvproperties.com',
        avatar_url: getAssetUrl('/images/darv-icon.png')
      };
      const demoToken = 'demo-jwt-darv-token-2026';
      localStorage.setItem('rem_token', demoToken);
      setToken(demoToken);
      setUser(demoUser);
      setAgency({
        ...DEMO_AGENCY,
        logo: getAssetUrl('/images/darv-logo.png'),
        logo_url: getAssetUrl('/images/darv-logo.png')
      });

      return {
        success: true,
        user: demoUser,
        ...demoUser
      };
    }

    throw new Error('Invalid username/email or password.');
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    if (res && res.success && res.token) {
      localStorage.setItem('rem_token', res.token);
      setToken(res.token);
      setUser(res.user);
      fetchPrimaryAgency();
      return {
        success: true,
        user: res.user,
        ...res.user
      };
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
  const cleanPhone = (agency?.phone || '+91 6282649279').replace(/[^0-9]/g, '');
  const cleanWhatsapp = (agency?.whatsapp || agency?.phone || '+91 6282649279').replace(/[^0-9]/g, '');
  const formattedWhatsapp = cleanWhatsapp.length === 10 ? '91' + cleanWhatsapp : cleanWhatsapp;

  const getCallUrl = (overridePhone) => {
    const p = overridePhone || agency?.phone || '+91 6282649279';
    return `tel:${p}`;
  };

  const getWhatsappUrl = (messageText, overrideWhatsapp) => {
    let w = (overrideWhatsapp || formattedWhatsapp || '916282649279').replace(/[^0-9]/g, '');
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
