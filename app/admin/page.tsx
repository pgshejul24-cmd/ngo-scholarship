'use client';

// ============================================================
// app/admin/page.tsx
// Main admin dashboard with applications table, filters, search.
// Protected by middleware + client-side auth check.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, LogOut, CheckCircle, XCircle, Clock,
  Eye, ChevronLeft, ChevronRight, Loader2, FileText, TrendingUp
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Application, ApplicationStatus } from '@/types/database';

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected'] as const;
type StatusFilter = typeof STATUS_OPTIONS[number];

const statusConfig: Record<string, { icon: JSX.Element; label: string; classes: string }> = {
  pending: { icon: <Clock className="w-3 h-3" />, label: 'Pending', classes: 'bg-amber-100 text-amber-800' },
  approved: { icon: <CheckCircle className="w-3 h-3" />, label: 'Approved', classes: 'bg-green-100 text-green-800' },
  rejected: { icon: <XCircle className="w-3 h-3" />, label: 'Rejected', classes: 'bg-red-100 text-red-800' },
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [adminEmail, setAdminEmail] = useState('');

  // Stats
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: String(page),
        per_page: '20',
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/applications?${params}`);
      if (res.status === 401) { router.push('/admin/login'); return; }

      const data = await res.json();
      setApplications(data.applications || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch {
      console.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, router]);

  const fetchStats = useCallback(async () => {
    try {
      const [p, a, r] = await Promise.all(
        ['pending', 'approved', 'rejected'].map(s =>
          fetch(`/api/admin/applications?status=${s}&per_page=1`).then(r => r.json())
        )
      );
      setStats({
        pending: p.total || 0,
        approved: a.total || 0,
        rejected: r.total || 0,
        total: (p.total || 0) + (a.total || 0) + (r.total || 0),
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/admin/login');
      else setAdminEmail(user.email || '');
    });
    fetchStats();
  }, [supabase, router, fetchStats]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setActionLoading(id + action);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action }),
      });
      if (res.ok) {
        fetchApplications();
        fetchStats();
      }
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    window.open(`/api/admin/export-csv?${params}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Scholarship Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">{adminEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-white' },
            { label: 'Pending Review', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Approved', value: stats.approved, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl border border-gray-100 p-4`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {STATUS_OPTIONS.map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button onClick={handleSearch}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                Search
              </button>
              {search && (
                <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                  className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Income / Requested</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => {
                    const sc = statusConfig[app.status];
                    return (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{app.full_name}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-gray-700">₹{Number(app.income).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-primary-600">Needs: ₹{Number(app.amount_requested).toLocaleString('en-IN')}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                            <span className={`font-semibold ${
                              (app.score || 0) >= 70 ? 'text-green-600' :
                              (app.score || 0) >= 40 ? 'text-amber-600' : 'text-gray-600'
                            }`}>{app.score ?? '—'}/100</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sc.classes}`}>
                            {sc.icon}{sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {app.document_url && (
                              <a href={app.document_url} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors" title="View document">
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            {app.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAction(app.id, 'approved')}
                                  disabled={!!actionLoading}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50 flex items-center gap-1">
                                  {actionLoading === app.id + 'approved' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAction(app.id, 'rejected')}
                                  disabled={!!actionLoading}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-1">
                                  {actionLoading === app.id + 'rejected' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total} applications
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs text-gray-600">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
