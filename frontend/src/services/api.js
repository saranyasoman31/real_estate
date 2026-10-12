import axios from 'axios';

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

// Global response handler
API.interceptors.response.use(
  (response) => response.data,
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

// Properties Service
export const propertyService = {
  getProperties: (params) => API.get('/properties', { params }),
  getPropertyById: (id) => API.get(`/properties/${id}`),
  toggleFavorite: (id) => API.post(`/properties/${id}/favorite`),
  getFavorites: () => API.get('/properties/user/favorites'),

  // Client Owner Inventory Management
  getClientDashboard: () => API.get('/properties/client/dashboard'),
  getClientProperties: (params) => API.get('/properties/client/my-listings', { params }),
  createProperty: (data) => API.post('/properties/client/create', data),
  updateProperty: (id, data) => API.put(`/properties/client/${id}`, data),
  changeStatus: (id, status) => API.put(`/properties/client/${id}/status`, { status }),
  toggleFeatured: (id) => API.put(`/properties/client/${id}/feature`),
  deleteProperty: (id) => API.delete(`/properties/client/${id}`),

  uploadImage: (formData) => API.post('/properties/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Aliases for agent component compatibility
  getAgentProperties: (params) => API.get('/properties/client/my-listings', { params }),
};

// Enquiries / Leads / Messages Service
export const enquiryService = {
  submitEnquiry: (data) => API.post('/enquiries/submit', data),
  getMyEnquiries: () => API.get('/enquiries/my'),
  getClientEnquiries: (params) => API.get('/enquiries/client', { params }),
  updateEnquiryStatus: (id, data) => API.put(`/enquiries/client/${id}`, data),
  getAgentEnquiries: (params) => API.get('/enquiries/client', { params }),
  pushEmail: (id, data) => API.post(`/enquiries/client/${id}/email-push`, data),
  getEmailHistory: (id) => API.get(`/enquiries/client/${id}/email-history`),
};

// Master Data Service
export const masterDataService = {
  getPropertyTypes: () => API.get('/master-data/property-types'),
  getAmenities: () => API.get('/master-data/amenities'),
  getLocations: () => API.get('/master-data/locations'),
};

// Notifications Service
export const notificationService = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

// Agent Profile & Management Service
export const agentService = {
  getPrimaryAgent: () => API.get('/agents/public/primary'),
  getMyProfile: () => API.get('/agents/profile/me'),
  updateMyProfile: (data) => API.put('/agents/profile/me', data),
  uploadLogo: (formData) => API.post('/agents/profile/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadDocument: (data) => API.post('/agents/documents/upload', data),
  getAgentDashboard: () => propertyService.getClientDashboard(),
  getAgentProfile: () => API.get('/agents/profile/me'),
  updateProfile: (data) => API.put('/agents/profile/me', data),
};

export const adminService = {
  getStats: () => propertyService.getClientDashboard(),
};

// Customer Feedback & Trust Score Service
export const feedbackService = {
  submitFeedback: (data) => API.post('/feedback', data),
  getPublicFeedback: (params) => API.get('/feedback/public', { params }),
  getTrustStats: () => API.get('/feedback/stats'),
  getAgentFeedback: (params) => API.get('/feedback/agent', { params }),
  replyToFeedback: (id, reply) => API.put(`/feedback/agent/${id}/reply`, { reply }),
  toggleFeatured: (id) => API.put(`/feedback/agent/${id}/feature`),
  deleteFeedback: (id) => API.delete(`/feedback/agent/${id}`),
};

export default API;
