import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending:  { label: 'Under Review',  color: 'bg-amber-100 text-amber-800',  icon: '⏳' },
  approved: { label: 'Approved',       color: 'bg-green-100 text-green-800',   icon: '✅' },
  rejected: { label: 'Not Selected',  color: 'bg-red-100 text-red-800',       icon: '❌' },
};

export default async function StatusPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id;
  let application = null;

  if (id) {
    // Security: Only return safe, non-sensitive fields to applicant
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('applications')
      .select('id, full_name, status, created_at, amount_requested')
      .eq('id', id)
      .single();
    application = data;
  }

  const status = application?.status ? STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] : null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">← Home</Link>
          <h1 className="text-3xl font-bold text-[#1a3c5e]">Application Status</h1>
        </div>

        {!id && (
          <form className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enter your Application ID
            </label>
            <input
              name="id" type="text"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#1a3c5e]/20"
              placeholder="e.g. 550e8400-e29b..."
            />
            <button
              formAction={`/status`}
              type="submit"
              className="w-full py-3 bg-[#1a3c5e] text-white rounded-xl font-semibold">
              Check Status
            </button>
          </form>
        )}

        {id && !application && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Application Not Found</h2>
            <p className="text-slate-500 text-sm mb-6">No application was found with this ID. Please check and try again.</p>
            <Link href="/status" className="text-[#1a3c5e] font-medium hover:underline">Try Again</Link>
          </div>
        )}

        {application && status && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">{status.icon}</div>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Applicant</span>
                <span className="font-medium">{application.full_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono font-medium">#{application.id.substring(0,8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Amount</span>
                <span className="font-medium">₹{Number(application.amount_requested).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Submitted</span>
                <span className="font-medium">{new Date(application.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            {application.status === 'pending' && (
              <div className="mt-6 bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
                Your application is currently being reviewed. You will receive an email notification when a decision is made.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
