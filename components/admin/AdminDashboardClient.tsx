'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Application } from '@/types';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const STATUS_COLORS = {
  pending:  'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminDashboardClient({ user, stats }: { user: any; stats: Stats }) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [selected, setSelected] = useState<Application | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      status: filter,
      page: String(page),
      limit: '15',
      ...(search ? { search } : {}),
    });
    const res = await fetch(`/api/admin/applications?${params}`);
    if (res.ok) {
      const json = await res.json();
      console.log('API response:', json);
      setApplications(json.applications ?? []);
      setTotal(json.total ?? 0);
    }
    setLoading(false);
  }, [filter, search, page]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleAction(id: string, status: 'approved' | 'rejected') {
    setProcessing(true);
    const res = await fetch('/api/admin/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setSelected(null);
      fetchApplications();
    }
    setProcessing(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="bg-[#1a3c5e] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <span className="font-semibold text-lg">Scholarship Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">{user.email}</span>
          <button onClick={handleLogout}
            className="text-sm px-3 py-1.5 border border-white/30 rounded-lg hover:bg-white/10 transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total,    color: 'bg-blue-50 border-blue-200',   text: 'text-blue-800'  },
            { label: 'Pending', value: stats.pending, color: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
            { label: 'Approved', value: stats.approved, color: 'bg-green-50 border-green-200', text: 'text-green-800' },
            { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 border-red-200',   text: 'text-red-800'  },
          ].map(s => (
            <div key={s.label} className={`${s.color} border rounded-xl p-5`}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text" placeholder="Search name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]/20"
          />
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-[#1a3c5e] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{f}</button>
            ))}
          </div>
          <a href="/api/admin/export" download
            className="px-4 py-2 bg-[#2e7d32] text-white rounded-lg text-sm font-medium hover:bg-[#1b5e20] transition-colors ml-auto">
            Export CSV
          </a>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No applications found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Applicant','Email','Income','Amount','Score','Status','Date','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-slate-600 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{app.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{app.email}</td>
                    <td className="px-4 py-3">₹{Number(app.income).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">₹{Number(app.amount_requested).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${app.score >= 70 ? 'text-green-700' : app.score >= 40 ? 'text-amber-700' : 'text-red-700'}`}>
                        {app.score ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(app.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(app)}
                        className="px-3 py-1 bg-[#1a3c5e] text-white text-xs rounded-lg hover:bg-[#0d2d45] transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <span className="text-sm text-slate-500">Showing {(page-1)*15+1}–{Math.min(page*15, total)} of {total}</span>
              <div className="flex gap-2">
                <button disabled={page===1} onClick={() => setPage(p => p-1)}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50">Prev</button>
                <button disabled={page===totalPages} onClick={() => setPage(p => p+1)}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1a3c5e]">Application Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['Full Name', selected.full_name],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Address', selected.address],
                ['Annual Income', `₹${Number(selected.income).toLocaleString('en-IN')}`],
                ['Amount Requested', `₹${Number(selected.amount_requested).toLocaleString('en-IN')}`],
                ['Priority Score', `${selected.score ?? '-'}/100`],
                ['Status', selected.status],
                ['Submitted', new Date(selected.created_at).toLocaleString('en-IN')],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <span className="w-40 text-sm font-medium text-slate-500 shrink-0">{label}</span>
                  <span className="text-sm text-slate-800 capitalize">{value}</span>
                </div>
              ))}
              <div>
                <span className="text-sm font-medium text-slate-500">Reason</span>
                <p className="mt-1 text-sm text-slate-700 bg-slate-50 rounded-xl p-4 leading-relaxed">{selected.reason}</p>
              </div>
              {selected.document_url && (
                <a href={selected.document_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
                  📎 View Document
                </a>
              )}
            </div>
            {selected.status === 'pending' && (
              <div className="p-6 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => handleAction(selected.id, 'approved')}
                  disabled={processing}
                  className="flex-1 py-3 bg-[#2e7d32] hover:bg-[#1b5e20] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                  {processing ? '...' : '✅ Approve'}
                </button>
                <button
                  onClick={() => handleAction(selected.id, 'rejected')}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
                  {processing ? '...' : '❌ Reject'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
