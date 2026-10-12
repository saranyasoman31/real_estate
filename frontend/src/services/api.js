import axios from 'axios';
import {
  DEMO_AGENCY,
  DEMO_PROPERTIES,
  DEMO_PROPERTY_TYPES,
  DEMO_LOCATIONS,
  DEMO_TESTIMONIALS,
  DEMO_STATS,
  DEMO_ENQUIRIES
} from './demoData';

const getBaseApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith('/darv')) {
    return '/DARV/api/v1';
  }
  return '/api/v1';
};

const API = axios.create({
  baseURL: getBaseApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rem_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global response handler with static HTML interceptor
API.interceptors.response.use(
  (response) => {
    // If static hosting (e.g. Hostinger Apache rewrite) returned HTML instead of JSON
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!') || response.data.trim().startsWith('<html'))
    ) {
      const err = new Error('Static hosting fallback: API endpoint returned HTML');
      err.isHtmlResponse = true;
      return Promise.reject(err);
    }
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Properties Service with robust fallback
export const propertyService = {
  getProperties: async (params = {}) => {
    try {
      const res = await API.get('/properties', { params });
      if (res && res.success && Array.isArray(res.data)) {
        return res;
      }
    } catch (err) {
      // Fallback to local demo properties on static hosting
    }

    let list = [...DEMO_PROPERTIES];
    if (params.type && params.type !== 'all') {
      list = list.filter(p => p.property_type_slug === params.type || String(p.property_type_id) === String(params.type));
    }
    if (params.listing_type && params.listing_type !== 'all') {
      list = list.filter(p => p.listing_type === params.listing_type);
    }
    if (params.city && params.city !== 'All Cities') {
      list = list.filter(p => p.city?.toLowerCase() === params.city.toLowerCase());
    }
    if (params.keyword) {
      const q = params.keyword.toLowerCase();
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.locality && p.locality.toLowerCase().includes(q)) ||
        (p.ref_number && p.ref_number.toLowerCase().includes(q))
      );
    }
    if (params.is_featured === 'true' || params.is_featured === true) {
      list = list.filter(p => p.is_featured);
    }

    const limit = Number(params.limit) || 12;
    const page = Number(params.page) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginated,
      total: list.length,
      totalPages: Math.ceil(list.length / limit) || 1,
      page,
      limit
    };
  },

  getPropertyById: async (id) => {
    try {
      const res = await API.get(`/properties/${id}`);
      if (res && res.success && res.data) {
        return res;
      }
    } catch (err) {
      // Fallback
    }

    const prop = DEMO_PROPERTIES.find(p => String(p.id) === String(id) || p.ref_number === id) || DEMO_PROPERTIES[0];
    return { success: true, data: prop };
  },

  toggleFavorite: async (id) => {
    try {
      return await API.post(`/properties/${id}/favorite`);
    } catch (e) {
      return { success: true, favorited: true };
    }
  },

  getFavorites: async () => {
    try {
      return await API.get('/properties/user/favorites');
    } catch (e) {
      return { success: true, data: [] };
    }
  },

  // Client Owner Inventory Management
  getClientDashboard: async () => {
    try {
      const res = await API.get('/properties/client/dashboard');
      if (res && res.success) {
        return res;
      }
    } catch (e) {
      // Fallback to demo stats
    }

    return {
      success: true,
      stats: DEMO_STATS,
      byType: DEMO_PROPERTY_TYPES.map(t => ({ name: t.name, slug: t.slug, count: t.count })),
      recentEnquiries: DEMO_ENQUIRIES
    };
  },

  getClientProperties: async (params = {}) => {
    try {
      const res = await API.get('/properties/client/my-listings', { params });
      if (res && res.success && Array.isArray(res.data)) {
        return res;
      }
    } catch (e) {
      // Fallback
    }

    return {
      success: true,
      data: DEMO_PROPERTIES,
      total: DEMO_PROPERTIES.length
    };
  },

  createProperty: async (data) => {
    try {
      return await API.post('/properties/client/create', data);
    } catch (e) {
      return { success: true, message: 'Property created (Demo Mode).' };
    }
  },

  updateProperty: async (id, data) => {
    try {
      return await API.put(`/properties/client/${id}`, data);
    } catch (e) {
      return { success: true, message: 'Property updated (Demo Mode).' };
    }
  },

  changeStatus: async (id, status) => {
    try {
      return await API.put(`/properties/client/${id}/status`, { status });
    } catch (e) {
      return { success: true, status };
    }
  },

  toggleFeatured: async (id) => {
    try {
      return await API.put(`/properties/client/${id}/feature`);
    } catch (e) {
      return { success: true, is_featured: true };
    }
  },

  deleteProperty: async (id) => {
    try {
      return await API.delete(`/properties/client/${id}`);
    } catch (e) {
      return { success: true };
    }
  },

  uploadImage: (formData) => API.post('/properties/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Aliases for agent component compatibility
  getAgentProperties: (params) => propertyService.getClientProperties(params),
};

// Enquiries / Leads / Messages Service
export const enquiryService = {
  submitEnquiry: async (data) => {
    try {
      return await API.post('/enquiries/submit', data);
    } catch (e) {
      return { success: true, message: 'Enquiry received. Saranya Soman will contact you shortly.' };
    }
  },
  getMyEnquiries: async () => {
    try {
      return await API.get('/enquiries/my');
    } catch (e) {
      return { success: true, data: [] };
    }
  },
  getClientEnquiries: async (params) => {
    try {
      const res = await API.get('/enquiries/client', { params });
      if (res && res.success) return res;
    } catch (e) {}
    return { success: true, data: DEMO_ENQUIRIES, total: DEMO_ENQUIRIES.length };
  },
  updateEnquiryStatus: async (id, data) => {
    try {
      return await API.put(`/enquiries/client/${id}`, data);
    } catch (e) {
      return { success: true };
    }
  },
  getAgentEnquiries: (params) => enquiryService.getClientEnquiries(params),
  pushEmail: async (id, data) => {
    try {
      return await API.post(`/enquiries/client/${id}/email-push`, data);
    } catch (e) {
      return { success: true, message: 'Email dispatched.' };
    }
  },
  getEmailHistory: async (id) => {
    try {
      return await API.get(`/enquiries/client/${id}/email-history`);
    } catch (e) {
      return { success: true, data: [] };
    }
  },
};

// Master Data Service
export const masterDataService = {
  getPropertyTypes: async () => {
    try {
      const res = await API.get('/master-data/property-types');
      if (res && res.success && Array.isArray(res.data)) return res;
    } catch (e) {}
    return { success: true, data: DEMO_PROPERTY_TYPES };
  },
  getAmenities: async () => {
    try {
      const res = await API.get('/master-data/amenities');
      if (res && res.success && Array.isArray(res.data)) return res;
    } catch (e) {}
    return {
      success: true,
      data: [
        { id: 1, name: 'Swimming Pool', icon: 'Waves' },
        { id: 2, name: 'Gymnasium & Fitness Center', icon: 'Dumbbell' },
        { id: 3, name: '24/7 Security & CCTV', icon: 'ShieldCheck' },
        { id: 4, name: 'Power Backup (100%)', icon: 'Zap' },
        { id: 5, name: 'Clubhouse & Party Hall', icon: 'Users' },
        { id: 6, name: 'Covered Car Parking', icon: 'Car' },
        { id: 7, name: 'Landscaped Zen Gardens', icon: 'Trees' },
        { id: 8, name: 'EV Charging Station', icon: 'BatteryCharging' }
      ]
    };
  },
  getLocations: async () => {
    try {
      const res = await API.get('/master-data/locations');
      if (res && res.success) return res;
    } catch (e) {}
    return { success: true, ...DEMO_LOCATIONS };
  },
};

// Notifications Service
export const notificationService = {
  getNotifications: async () => {
    try {
      return await API.get('/notifications');
    } catch (e) {
      return { success: true, data: [] };
    }
  },
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

// Agent Profile & Management Service
export const agentService = {
  getPrimaryAgent: async () => {
    try {
      const res = await API.get('/agents/public/primary');
      if (res && res.success && res.data) return res;
    } catch (e) {}
    return { success: true, data: DEMO_AGENCY };
  },
  getMyProfile: async () => {
    try {
      const res = await API.get('/agents/profile/me');
      if (res && res.success && res.data) return res;
    } catch (e) {}
    return { success: true, data: DEMO_AGENCY };
  },
  updateMyProfile: (data) => API.put('/agents/profile/me', data),
  uploadLogo: (formData) => API.post('/agents/profile/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadDocument: (data) => API.post('/agents/documents/upload', data),
  getAgentDashboard: () => propertyService.getClientDashboard(),
  getAgentProfile: () => agentService.getMyProfile(),
  updateProfile: (data) => API.put('/agents/profile/me', data),
};

export const adminService = {
  getStats: () => propertyService.getClientDashboard(),
};

// Customer Feedback & Trust Score Service
export const feedbackService = {
  submitFeedback: async (data) => {
    try {
      return await API.post('/feedback', data);
    } catch (e) {
      return { success: true, message: 'Review submitted. Thank you for your feedback!' };
    }
  },
  getPublicFeedback: async (params) => {
    try {
      const res = await API.get('/feedback/public', { params });
      if (res && res.success && Array.isArray(res.data)) return res;
    } catch (e) {}
    return { success: true, data: DEMO_TESTIMONIALS };
  },
  getTrustStats: async () => {
    try {
      const res = await API.get('/feedback/stats');
      if (res && res.success) return res;
    } catch (e) {}
    return {
      success: true,
      metrics: {
        trustScore: 100,
        averageRating: 5.0,
        totalReviews: DEMO_TESTIMONIALS.length,
        verifiedProperties: 100
      }
    };
  },
  getAgentFeedback: async (params) => {
    try {
      const res = await API.get('/feedback/agent', { params });
      if (res && res.success) return res;
    } catch (e) {}
    return { success: true, data: DEMO_TESTIMONIALS };
  },
  replyToFeedback: async (id, reply) => {
    try {
      return await API.put(`/feedback/agent/${id}/reply`, { reply });
    } catch (e) {
      return { success: true };
    }
  },
  toggleFeatured: async (id) => {
    try {
      return await API.put(`/feedback/agent/${id}/feature`);
    } catch (e) {
      return { success: true };
    }
  },
  deleteFeedback: async (id) => {
    try {
      return await API.delete(`/feedback/agent/${id}`);
    } catch (e) {
      return { success: true };
    }
  },
};

export default API;
