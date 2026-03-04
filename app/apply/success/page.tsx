import Link from 'next/link';

export default function SuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  const ref = searchParams.id?.substring(0, 8).toUpperCase() ?? '';
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-[#1a3c5e] mb-3">Application Submitted!</h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Your application has been received. We will review it within 7–10 business days and notify you via email.
        </p>
        {ref && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Reference Number</p>
            <p className="text-2xl font-bold text-[#1a3c5e] tracking-wider">#{ref}</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {searchParams.id && (
            <Link href={`/status?id=${searchParams.id}`}
              className="w-full py-3 bg-[#1a3c5e] text-white rounded-xl font-medium hover:bg-[#0d2d45] transition-colors">
              Track Application Status
            </Link>
          )}
          <Link href="/" className="w-full py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
