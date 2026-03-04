'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormErrors {
  [key: string]: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const form = e.currentTarget;
    const data = new FormData(form);

    const res = await fetch('/api/apply', { method: 'POST', body: data });
    const json = await res.json();

    if (!res.ok) {
      setErrors(json.details ?? { _form: json.error ?? 'Submission failed.' });
      setSubmitting(false);
      return;
    }

    router.push(`/apply/success?id=${json.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">← Back</Link>
          <h1 className="text-4xl font-bold text-[#1a3c5e] mb-2">Scholarship Application</h1>
          <p className="text-slate-600">Fill out all fields carefully. All information is kept confidential.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          {/* Honeypot — hidden from real users, bots will fill it */}
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

          {errors._form && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors._form}
            </div>
          )}

          <Section title="Personal Information">
            <Field label="Full Name *" error={errors.full_name}>
              <input name="full_name" type="text" className={input(errors.full_name)} placeholder="Priya Sharma" required />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Address *" error={errors.email}>
                <input name="email" type="email" className={input(errors.email)} placeholder="you@example.com" required />
              </Field>
              <Field label="Phone Number *" error={errors.phone}>
                <input name="phone" type="tel" className={input(errors.phone)} placeholder="+919876543210" required />
              </Field>
            </div>
            <Field label="Address *" error={errors.address}>
              <textarea name="address" rows={2} className={input(errors.address)} placeholder="123 Main St, Mumbai, Maharashtra" required />
            </Field>
          </Section>

          <Section title="Financial Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Annual Family Income (₹) *" error={errors.income}>
                <input name="income" type="number" min="0" className={input(errors.income)} placeholder="250000" required />
              </Field>
              <Field label="Scholarship Amount Requested (₹) *" error={errors.amount_requested}>
                <input name="amount_requested" type="number" min="1000" className={input(errors.amount_requested)} placeholder="50000" required />
              </Field>
            </div>
          </Section>

          <Section title="Application Details">
            <Field label="Reason for Scholarship (min. 50 characters) *" error={errors.reason}>
              <textarea name="reason" rows={5} className={input(errors.reason)}
                placeholder="Describe your financial need, academic achievements, and how this scholarship will help you..." required />
            </Field>
            <Field label="Supporting Document (PDF/JPG/PNG, max 5MB)" error={errors.document}>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#1a3c5e] rounded-xl p-6 text-center cursor-pointer transition-colors">
                <div className="text-3xl mb-2">📎</div>
                <p className="text-sm text-slate-600">
                  {fileName ? <span className="font-medium text-[#1a3c5e]">{fileName}</span> : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>
              <input
                ref={fileRef} name="document" type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              />
            </Field>
          </Section>

          <div className="bg-slate-50 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input name="declaration" type="checkbox" value="true"
                className="mt-1 w-4 h-4 rounded border-slate-300 text-[#2e7d32] focus:ring-[#2e7d32]" required />
              <span className="text-sm text-slate-700 leading-relaxed">
                I declare that all information provided is true and accurate. I understand that providing false information may result in disqualification. I consent to the NGO processing my data for scholarship evaluation purposes.
              </span>
            </label>
            {errors.declaration && <p className="text-red-500 text-xs mt-2">{errors.declaration}</p>}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-4 bg-[#1a3c5e] hover:bg-[#0d2d45] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-lg transition-all">
            {submitting ? 'Submitting...' : 'Submit Application →'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  );
}

function input(error?: string) {
  return `w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
    error
      ? 'border-red-300 focus:ring-red-200 bg-red-50'
      : 'border-slate-300 focus:ring-[#1a3c5e]/20 focus:border-[#1a3c5e]'
  }`;
}
