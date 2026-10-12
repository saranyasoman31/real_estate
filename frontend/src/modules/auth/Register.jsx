import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, User, Mail, Lock, Phone, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { showAlertSuccess } from '../../utils/alerts';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      await showAlertSuccess('Account Created!', 'Welcome to ApexRealty customer marketplace.');
      navigate('/properties');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
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
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')`
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
                src="/images/darv-logo.png"
                alt="DARV Real Estate & Construction"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-[11px] font-bold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Portal</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Create Customer Account
            </h2>
            <p className="text-xs text-slate-400">
              Save favorite properties, book site visits, and contact the agent directly.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 text-red-300 border border-red-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number (Optional)</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              <span>{loading ? 'Creating Account...' : 'Sign Up as Customer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer link */}
          <div className="pt-2 text-center border-t border-slate-800 space-y-1.5">
            <p className="text-[11px] text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 font-bold hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-[10px] text-slate-500">
              Are you the Property Agent?{' '}
              <Link to="/admin" className="text-slate-400 hover:text-white underline">
                Agent Portal Login
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;
