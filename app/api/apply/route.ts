import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createAdminClient } from '@/lib/supabase/server';
import { applicationSchema, validateFileType, validateFileSize, sanitizeString, calculateScore } from '@/lib/validations';
import { generateApprovalToken, getTokenExpiry } from '@/lib/tokens';
import { sendEmail, ADMIN_EMAIL } from '@/lib/email';
import { adminNotificationEmail, applicantSubmissionConfirmationEmail } from '@/emails/templates';
import { rateLimit } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit';

// Security: Rate limit submissions to 3 per IP per 15 minutes
// This prevents automated spam while allowing legitimate retries
const RATE_LIMIT_CONFIG = { windowMs: 15 * 60 * 1000, max: 3 };

export async function POST(req: NextRequest) {
  // 1. Rate limiting — identify by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const limited = rateLimit(`apply:${ip}`, RATE_LIMIT_CONFIG);
  if (!limited.success) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait 15 minutes and try again.' },
      { status: 429 }
    );
  }

  // 2. Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  // 3. Extract and sanitize fields
  const rawData = {
    full_name:        sanitizeString(formData.get('full_name') as string ?? ''),
    email:            sanitizeString(formData.get('email') as string ?? ''),
    phone:            sanitizeString(formData.get('phone') as string ?? ''),
    address:          sanitizeString(formData.get('address') as string ?? ''),
    income:           Number(formData.get('income')),
    amount_requested: Number(formData.get('amount_requested')),
    reason:           sanitizeString(formData.get('reason') as string ?? ''),
    declaration:      formData.get('declaration') === 'true',
  };

  // 4. Server-side validation — Zod schema
  const parsed = applicationSchema.safeParse(rawData);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // 5. Anti-spam honeypot check (field named 'website' should be empty)
  const honeypot = formData.get('website');
  if (honeypot && honeypot !== '') {
    // Silently reject bots
    return NextResponse.json({ success: true, id: uuidv4() });
  }

  // 6. Handle file upload
  const file = formData.get('document') as File | null;
  let document_url: string | null = null;

  if (file && file.size > 0) {
    if (!validateFileType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, PNG allowed.' },
        { status: 422 }
      );
    }
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: 'File too large. Maximum 5MB allowed.' },
        { status: 422 }
      );
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split('.').pop();
    // Security: Use UUID-based filename to prevent path traversal and enumeration
    const fileName = `${uuidv4()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scholarship-documents')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Document upload failed.' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('scholarship-documents')
      .getPublicUrl(uploadData.path);

    document_url = publicUrl;
  }

  // 7. Generate secure token
  const approvalToken = generateApprovalToken();
  const tokenExpiry = getTokenExpiry(48);
  const applicationId = uuidv4();
  const score = calculateScore(parsed.data.income, parsed.data.amount_requested);

  // 8. Insert into database
  const supabase = createAdminClient();
  const { data: appData, error: dbError } = await supabase
    .from('applications')
    .insert({
      id:               applicationId,
      full_name:        parsed.data.full_name,
      email:            parsed.data.email,
      phone:            parsed.data.phone,
      address:          parsed.data.address,
      income:           parsed.data.income,
      amount_requested: parsed.data.amount_requested,
      reason:           parsed.data.reason,
      document_url,
      status:           'pending',
      approval_token:   approvalToken,
      token_expiry:     tokenExpiry.toISOString(),
      score,
    })
    .select()
    .single();

  if (dbError || !appData) {
    console.error('DB insert error:', dbError);
    return NextResponse.json({ error: 'Failed to save application.' }, { status: 500 });
  }

  // 9. Create audit log
  await createAuditLog({
    applicationId,
    action: 'APPLICATION_SUBMITTED',
    performedBy: parsed.data.email,
    details: `Score: ${score}`,
  });

  // 10. Send emails (non-blocking — do not fail request on email error)
  try {
    await Promise.all([
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New Scholarship Application from ${appData.full_name}`,
        html: adminNotificationEmail(appData, score),
      }),
      sendEmail({
        to: appData.email,
        subject: 'Your scholarship application has been received',
        html: applicantSubmissionConfirmationEmail(appData),
      }),
    ]);
  } catch (emailErr) {
    // Log but don't fail the request
    console.error('Email send error:', emailErr);
  }

  return NextResponse.json({
    success: true,
    id: applicationId,
    message: 'Application submitted successfully.',
  });
}
