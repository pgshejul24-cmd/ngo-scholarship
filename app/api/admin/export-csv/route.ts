// ============================================================
// app/api/admin/export-csv/route.ts
// Export applications as CSV for offline analysis.
// Protected: requires admin auth session.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { Application } from '@/types/database';

export async function GET(req: NextRequest) {
  // Auth check
  const supabaseAuth = createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const supabase = createSupabaseAdminClient();
  
  let query = supabase
    .from('applications')
    .select('id,full_name,email,phone,address,income,amount_requested,status,score,created_at,reviewed_at')
    .order('created_at', { ascending: false });

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return new NextResponse('Export failed', { status: 500 });
  }

  const csv = generateCSV(data || []);
  const filename = `scholarship-applications-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function generateCSV(rows: Partial<Application>[]): string {
  const headers = [
    'ID', 'Full Name', 'Email', 'Phone', 'Address',
    'Annual Income', 'Amount Requested', 'Status', 
    'Priority Score', 'Submitted At', 'Reviewed At',
  ];

  const escape = (val: unknown): string => {
    const str = String(val ?? '');
    // Escape commas and quotes in CSV
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = rows.map((row) => [
    escape(row.id?.substring(0, 8).toUpperCase()),
    escape(row.full_name),
    escape(row.email),
    escape(row.phone),
    escape(row.address),
    escape(row.income),
    escape(row.amount_requested),
    escape(row.status),
    escape(row.score),
    escape(row.created_at ? new Date(row.created_at).toLocaleString() : ''),
    escape(row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : 'Not reviewed'),
  ].join(','));

  return [headers.join(','), ...csvRows].join('\n');
}
