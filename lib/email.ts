import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourscholarship.org';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourscholarship.org';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}

export { ADMIN_EMAIL };
