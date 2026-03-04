import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isTokenExpired } from '@/lib/tokens';
import { sendEmail } from '@/lib/email';
import { applicantRejectedEmail } from '@/emails/templates';
import { rateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id    = searchParams.get('id');
  const token = searchParams.get('token');

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const limited = rateLimit(`reject:${ip}`, { windowMs: 3600_000, max: 10 });
  if (!limited.success) return new NextResponse('Too many requests', { status: 429 });

  if (!id || !token) return new NextResponse('Missing parameters', { status: 400 });

  const supabase = createAdminClient();
  const { data: app, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !app) return new NextResponse('Application not found', { status: 404 });
  if (app.approval_token !== token) return new NextResponse('Invalid token', { status: 403 });
  if (isTokenExpired(app.token_expiry)) return new NextResponse('Token expired', { status: 410 });
  if (app.status !== 'pending') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard?notice=already_processed`);
  }

  await supabase.from('applications').update({ status: 'rejected' }).eq('id', id);

  await createAuditLog({
    applicationId: id,
    action: 'APPLICATION_REJECTED',
    performedBy: 'email_link',
    details: 'Rejected via one-click email link',
  });

  try {
    await sendEmail({
      to: app.email,
      subject: 'Update on Your Scholarship Application',
      html: applicantRejectedEmail(app),
    });
  } catch (e) {
    console.error('Rejection email error:', e);
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard?notice=rejected`);
}
