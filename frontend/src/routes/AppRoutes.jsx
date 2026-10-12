import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public & Customer Marketplace Pages
import HomePage from '../modules/home/HomePage';
import PropertyList from '../modules/properties/PropertyList';
import PropertyDetail from '../modules/properties/PropertyDetail';
import FavoritesPage from '../modules/customer/FavoritesPage';
import MyEnquiriesPage from '../modules/customer/MyEnquiriesPage';
import UserProfilePage from '../modules/customer/UserProfilePage';

// Auth & Admin Portal Pages
import Login from '../modules/auth/Login';
import Register from '../modules/auth/Register';
import AdminLogin from '../modules/admin/AdminLogin';

// Agent / Owner Management Views
import ClientDashboard from '../modules/client/ClientDashboard';
import ClientProperties from '../modules/client/ClientProperties';
import ClientInquiries from '../modules/client/ClientInquiries';
import AddEditProperty from '../modules/agent/AddEditProperty';
import AgentProfile from '../modules/agent/AgentProfile';
import AgentFeedback from '../modules/agent/AgentFeedback';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 1. DEFAULT CUSTOMER MARKETPLACE ROUTES */}
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertyList />} />
      <Route path="/properties/:id" element={<PropertyDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer authenticated routes */}
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my/enquiries"
        element={
          <ProtectedRoute>
            <MyEnquiriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {user?.role === 'customer' ? <UserProfilePage /> : <AgentProfile />}
          </ProtectedRoute>
        }
      />

      {/* 2. AGENT / ADMIN LOGIN - OPENS WHEN USING /admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 3. AGENT / ADMIN MANAGEMENT PORTAL ROUTES */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/add"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AddEditProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AddEditProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inquiries"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AgentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AgentFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AgentFeedback />
          </ProtectedRoute>
        }
      />

      {/* Aliases for /client/... */}
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/properties"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/properties/add"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AddEditProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/properties/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AddEditProperty />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/inquiries"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/messages"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/enquiries"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <ClientInquiries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/profile"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AgentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/feedback"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
            <AgentFeedback />
          </ProtectedRoute>
        }
      />

      {/* Backward Compatibility */}
      <Route path="/agent/*" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/agents" element={<Navigate to="/properties" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
