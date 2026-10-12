import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssetUrl } from '../../utils/paths';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { showAlertSuccess, showAlertError } from '../../utils/alerts';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isClient } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // If already logged in as agent/client, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && isClient) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isClient, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);
      if (res && (res.success || res.user || res.id)) {
        await showAlertSuccess('Welcome Back, Agent!', 'Logged in to Property Management Console.');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      showAlertError('Authentication Failed', err.response?.data?.message || err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-140px)] relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 text-white">
      {/* Background Architectural Real Estate Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-[0.22] scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      
      {/* Background Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/80" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Back to Marketplace */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition bg-slate-900/70 hover:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Marketplace</span>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-amber-300/60 inline-flex items-center mx-auto mb-2">
              <img
                src={getAssetUrl('/images/darv-logo.png')}
                alt="DARV Real Estate & Construction"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-[11px] font-bold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Authorized Agent / Owner Portal</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Agent Sign In
            </h2>
            <p className="text-xs text-slate-400">
              Upload property inventory, update prices, and respond to incoming customer leads.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Agent Username / Email</label>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  required
                  placeholder="Enter agent username or email"
                  autoComplete="username"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Agent'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Public customer notice */}
          <div className="pt-2 text-center border-t border-slate-800">
            <p className="text-[11px] text-slate-400">
              Are you a property buyer or tenant?{' '}
              <Link to="/" className="text-brand-400 font-bold hover:underline">
                Explore Properties
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
