import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NGO Scholarship Management System',
  description: 'Apply for scholarships and track your application status.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
