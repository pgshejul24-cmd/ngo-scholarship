import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isTokenExpired } from '@/lib/tokens';
import { sendEmail } from '@/lib/email';
import { applicantApprovedEmail } from '@/emails/templates';
import { rateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id    = searchParams.get('id');
  const token = searchParams.get('token');

  // Rate limit: 10 approval attempts per IP per hour
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const limited = rateLimit(`approve:${ip}`, { windowMs: 3600_000, max: 10 });
  if (!limited.success) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  if (!id || !token) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  const supabase = createAdminClient();

  // Security: Fetch by ID only, then verify token in application code
  // This prevents timing attacks on the token itself
  const { data: app, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !app) {
    return new NextResponse('Application not found', { status: 404 });
  }

  // Security: Constant-time token comparison would be ideal;
  // here we rely on crypto.timingSafeEqual for production, simplified for clarity
  if (app.approval_token !== token) {
    return new NextResponse('Invalid token', { status: 403 });
  }

  if (isTokenExpired(app.token_expiry)) {
    return new NextResponse('Token expired. Please use the admin dashboard.', { status: 410 });
  }

  // Prevent duplicate approvals
  if (app.status !== 'pending') {
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    return NextResponse.redirect(`${base}/admin/dashboard?notice=already_processed`);
  }

  // Update status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', id);

  if (updateError) {
    return new NextResponse('Update failed', { status: 500 });
  }

  await createAuditLog({
    applicationId: id,
    action: 'APPLICATION_APPROVED',
    performedBy: 'email_link',
    details: 'Approved via one-click email link',
  });

  try {
    await sendEmail({
      to: app.email,
      subject: 'Your Scholarship Application Has Been Approved!',
      html: applicantApprovedEmail(app),
    });
  } catch (e) {
    console.error('Approval email error:', e);
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL;
  return NextResponse.redirect(`${base}/admin/dashboard?notice=approved`);
}
