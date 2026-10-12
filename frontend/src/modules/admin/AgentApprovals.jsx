import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Check,
  X,
  User,
  Ban,
  Search,
  ExternalLink
} from 'lucide-react';

const AgentApprovals = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectAgentId, setRejectAgentId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [statusFilter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await agentService.getAdminAgents({ status: statusFilter, search });
      if (res.success) {
        setAgents(res.data);
      }
    } catch (err) {
      console.error('Failed to load agents for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const res = await agentService.approveAgent(id);
      if (res.success) {
        fetchAgents();
      }
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await agentService.rejectAgent(rejectAgentId, rejectReason);
      if (res.success) {
        setRejectModalOpen(false);
        setRejectReason('');
        setRejectAgentId(null);
        fetchAgents();
      }
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await agentService.toggleStatus(id);
      if (res.success) {
        fetchAgents();
      }
    } catch (err) {
      alert('Status change failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
              SRS v1.0 Section 7.2
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              Agent KYC & License Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify RERA credentials and authenticity before granting listing publication rights to agents.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Agents' },
              { id: 'pending', label: 'Pending KYC Review' },
              { id: 'verified', label: 'Verified & Active' },
              { id: 'rejected', label: 'Rejected / Incomplete' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agents Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-32 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No agent profiles found</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={agent.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-xs shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{agent.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          agent.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          agent.verification_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {agent.verification_status}
                        </span>
                        {!agent.is_active && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                            Account Suspended
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-brand-600">
                        {agent.agency_name} • RERA License: <strong>{agent.license_number || 'Not supplied'}</strong>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Email: {agent.email}</span>
                        <span>•</span>
                        <span>Phone: {agent.user_phone || agent.phone || 'N/A'}</span>
                        <span>•</span>
                        <span>Cities: {agent.operating_cities || 'National'}</span>
                        <span>•</span>
                        <span>Listings: {agent.total_properties_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {agent.verification_status !== 'verified' && (
                      <button
                        onClick={() => handleApprove(agent.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify & Approve</span>
                      </button>
                    )}

                    {agent.verification_status !== 'rejected' && (
                      <button
                        onClick={() => {
                          setRejectAgentId(agent.id);
                          setRejectModalOpen(true);
                        }}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject KYC</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleStatus(agent.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        agent.is_active
                          ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      {agent.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </div>

                {/* Documents section */}
                {agent.documents && agent.documents.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-400">Attached Documents:</span>
                    {agent.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.doc_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-brand-600" />
                        <span>{doc.doc_type}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-slate-900">Reject Agent KYC Application</h4>
            <textarea
              rows="3"
              required
              placeholder="State reason (e.g. License expired, document unreadable, mismatched business address)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none"
            ></textarea>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentApprovals;
