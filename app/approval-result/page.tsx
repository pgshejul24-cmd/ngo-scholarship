'use client';

// ============================================================
// app/approval-result/page.tsx
// Landing page after admin clicks approve/reject in email.
// Shows a human-readable result.
// ============================================================

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, ShieldX } from 'lucide-react';

const RESULTS: Record<string, { icon: JSX.Element; title: string; message: string; color: string }> = {
  approved: {
    icon: <CheckCircle className="w-14 h-14 text-green-500" />,
    title: 'Application Approved',
    message: 'The scholarship application has been approved. The applicant has been notified via email.',
    color: 'border-green-200 bg-green-50',
  },
  rejected: {
    icon: <XCircle className="w-14 h-14 text-red-500" />,
    title: 'Application Rejected',
    message: 'The scholarship application has been rejected. The applicant has been notified via email.',
    color: 'border-red-200 bg-red-50',
  },
  expired: {
    icon: <Clock className="w-14 h-14 text-amber-500" />,
    title: 'Link Expired',
    message: 'This approval link has expired (links are valid for 48 hours). Please log in to the admin dashboard to review this application manually.',
    color: 'border-amber-200 bg-amber-50',
  },
  invalid: {
    icon: <ShieldX className="w-14 h-14 text-red-500" />,
    title: 'Invalid Link',
    message: 'This link is invalid or has been tampered with. For security, no changes have been made.',
    color: 'border-red-200 bg-red-50',
  },
  'already-approved': {
    icon: <CheckCircle className="w-14 h-14 text-gray-400" />,
    title: 'Already Approved',
    message: 'This application has already been approved. No changes were made.',
    color: 'border-gray-200 bg-gray-50',
  },
  'already-rejected': {
    icon: <XCircle className="w-14 h-14 text-gray-400" />,
    title: 'Already Rejected',
    message: 'This application has already been rejected. No changes were made.',
    color: 'border-gray-200 bg-gray-50',
  },
  'not-found': {
    icon: <AlertTriangle className="w-14 h-14 text-amber-500" />,
    title: 'Not Found',
    message: 'The application could not be found. It may have been deleted.',
    color: 'border-amber-200 bg-amber-50',
  },
  error: {
    icon: <AlertTriangle className="w-14 h-14 text-red-500" />,
    title: 'Server Error',
    message: 'Something went wrong. Please try again or log in to the admin dashboard.',
    color: 'border-red-200 bg-red-50',
  },
};

function ResultContent() {
  const params = useSearchParams();
  const status = params.get('status') || 'error';
  const result = RESULTS[status] || RESULTS.error;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className={`rounded-2xl border-2 p-8 text-center ${result.color}`}>
          <div className="flex justify-center mb-5">{result.icon}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{result.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-6">{result.message}</p>
          <a href="/admin"
            className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}
