import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('applications')
    .select('id,full_name,email,phone,address,income,amount_requested,reason,status,score,created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Export failed' }, { status: 500 });

  const headers = ['ID','Name','Email','Phone','Address','Income','Amount Requested','Reason','Status','Score','Submitted At'];
  const rows = data.map(r => [
    r.id, r.full_name, r.email, r.phone, r.address,
    r.income, r.amount_requested,
    `"${(r.reason ?? '').replace(/"/g, '""')}"`,
    r.status, r.score,
    new Date(r.created_at).toLocaleString()
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="scholarship-applications-${Date.now()}.csv"`,
    },
  });
}
