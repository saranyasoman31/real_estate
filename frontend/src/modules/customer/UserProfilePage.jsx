import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { User, Phone, Mail, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

const UserProfilePage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await authService.updateProfile(formData);
      if (res.success) {
        setMessage('Profile details updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
            <img
              src={formData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-md"
            />
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{user?.name}</h1>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                Role: {user?.role}
              </span>
            </div>
          </div>

          {message && (
            <div className="p-3.5 mb-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
