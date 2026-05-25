import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  ShieldAlert, 
  Users, 
  Video, 
  Trophy, 
  Sparkles, 
  Trash2, 
  UserCog, 
  AlertTriangle,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err.message);
      setError('Access forbidden: Administrator authorization verified key is required.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    setError('');
    setMessage('');
    setActionLoadingId(userId);
    const targetRole = currentRole === 'student' ? 'admin' : 'student';

    try {
      const res = await api.put(`/admin/role/${userId}`, { role: targetRole });
      if (res.data.success) {
        setMessage(res.data.message);
        // Refresh local listings
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
    setActionLoadingId(null);
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user profile? All associated mock interview histories and reports will be permanently purged.")) {
      return;
    }

    setError('');
    setMessage('');
    setActionLoadingId(userId);

    try {
      const res = await api.delete(`/admin/user/${userId}`);
      if (res.data.success) {
        setMessage(res.data.message);
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
    setActionLoadingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-t-primary border-r-transparent border-l-transparent border-b-secondary animate-spin"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center p-8 glass-card border border-danger/20 rounded-3xl max-w-md mx-auto my-12 flex flex-col items-center gap-4">
        <ShieldAlert className="w-12 h-12 text-danger" />
        <h3 className="text-xl font-bold">Access Denied</h3>
        <p className="text-sm font-semibold text-foreground/50">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-primary" /> Admin Panel
        </h2>
        <p className="text-sm font-semibold text-foreground/50 mt-1">
          Monitor platform metrics, manage user role authentications, and audit simulated operations.
        </p>
      </div>

      {/* Success / Error feedbacks */}
      {message && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-xs font-semibold text-green-400">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-xs font-semibold text-red-200">
          {error}
        </div>
      )}

      {/* Metrics widgets */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Active Students</span>
                <span className="text-2xl font-black">{stats.totalUsers}</span>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Interviews Created</span>
                <span className="text-2xl font-black text-secondary">{stats.totalInterviews}</span>
              </div>
              <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                <Video className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Graded Reports</span>
                <span className="text-2xl font-black text-green-400">{stats.completedReports}</span>
              </div>
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-3xl glass-card border border-border/80 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Platform Average</span>
                <span className="text-2xl font-black text-accent">{stats.avgPlatformScore}%</span>
              </div>
              <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Category distribution */}
            <div className="p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold border-b border-border pb-3">Mock Rounds Distribution</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(stats.distribution).map(([category, count]) => {
                  const max = Math.max(...Object.values(stats.distribution), 1);
                  const pct = Math.round((count / max) * 100);
                  
                  return (
                    <div key={category} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-foreground/75">{category}</span>
                        <span className="text-primary">{count} rounds</span>
                      </div>
                      <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Students list Table */}
            <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-border/80 flex flex-col gap-4">
              <h3 className="text-sm font-extrabold border-b border-border pb-3">Active Registered Candidates</h3>
              <div className="overflow-x-auto max-h-[360px]">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-border/60 text-foreground/40 uppercase tracking-widest">
                      <th className="py-2.5 pl-2">Name</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users.map((u) => (
                      <tr key={u._id} className="border-b border-border/30 hover:bg-card/20 transition-colors">
                        <td className="py-3 pl-2 text-foreground font-bold">{u.name}</td>
                        <td className="py-3 text-foreground/75">{u.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-accent/15 text-accent border border-accent/25' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2">
                          {actionLoadingId === u._id ? (
                            <Loader className="w-4 h-4 animate-spin inline" />
                          ) : (
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => handleRoleToggle(u._id, u.role)}
                                title="Toggle user role permission"
                                className="p-1.5 bg-card hover:bg-card/90 border border-border hover:border-primary/40 rounded-lg text-foreground/70 hover:text-primary transition-all"
                              >
                                <UserCog className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUserDelete(u._id)}
                                title="Permanently delete user profile"
                                className="p-1.5 bg-card hover:bg-card/90 border border-border hover:border-danger/45 rounded-lg text-foreground/70 hover:text-danger transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
