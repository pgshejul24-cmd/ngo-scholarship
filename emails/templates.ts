import { Application } from '../types';
import { format } from 'date-fns';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ngo-scholarship-git-main-pgshejul24-cmds-projects.vercel.app';

export function adminNotificationEmail(app: Application, score: number): string {
  const approveUrl = `${BASE_URL}/api/approve?id=${app.id}&token=${app.approval_token}`;
  const rejectUrl  = `${BASE_URL}/api/reject?id=${app.id}&token=${app.approval_token}`;
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1a3c5e,#2e7d32);padding:32px 40px;text-align:center;">
  <h1 style="color:#fff;margin:0;font-size:24px;">New Scholarship Application</h1>
  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Submitted on ${format(new Date(app.created_at), 'PPP')}</p>
</td></tr>
<tr><td style="padding:24px 40px 0;text-align:center;">
  <div style="display:inline-block;background:${score>=70?'#e8f5e9':score>=40?'#fff8e1':'#fce4ec'};
              border:2px solid ${score>=70?'#2e7d32':score>=40?'#f9a825':'#c62828'};
              border-radius:50px;padding:8px 24px;">
    <span style="font-weight:700;color:${score>=70?'#2e7d32':score>=40?'#f57f17':'#c62828'};font-size:18px;">
      Priority Score: ${score}/100
    </span>
  </div>
</td></tr>
<tr><td style="padding:24px 40px;">
  <table width="100%">
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <span style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;">Name</span><br/>
      <span style="font-size:15px;color:#222;">${app.full_name}</span>
    </td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <span style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;">Email</span><br/>
      <span style="font-size:15px;color:#222;">${app.email}</span>
    </td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <span style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;">Phone</span><br/>
      <span style="font-size:15px;color:#222;">${app.phone}</span>
    </td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <span style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;">Annual Income</span><br/>
      <span style="font-size:15px;color:#222;">Rs.${Number(app.income).toLocaleString('en-IN')}</span>
    </td></tr>
    <tr><td style="padding:8px 0;">
      <span style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;">Amount Requested</span><br/>
      <span style="font-size:15px;color:#222;">Rs.${Number(app.amount_requested).toLocaleString('en-IN')}</span>
    </td></tr>
  </table>
  <div style="background:#f9f9f9;border-left:4px solid #1a3c5e;padding:16px;border-radius:0 8px 8px 0;margin-top:16px;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#666;text-transform:uppercase;">Reason</p>
    <p style="margin:0;color:#333;line-height:1.6;font-size:14px;">${app.reason}</p>
  </div>
</td></tr>
<tr><td style="padding:0 40px 40px;">
  <div style="background:#f9f9f9;border-radius:12px;padding:24px;text-align:center;">
    <p style="margin:0 0 20px;font-size:14px;color:#c62828;font-weight:600;">Action links expire in 48 hours</p>
    <table width="100%"><tr>
      <td align="center" style="padding:0 8px;">
        <a href="${approveUrl}" style="display:block;padding:14px 32px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">Approve</a>
      </td>
      <td align="center" style="padding:0 8px;">
        <a href="${rejectUrl}" style="display:block;padding:14px 32px;background:#c62828;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">Reject</a>
      </td>
    </tr></table>
  </div>
</td></tr>
<tr><td style="background:#f4f7f6;padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
  <p style="margin:0;font-size:12px;color:#999;">NGO Scholarship Management System | <a href="${BASE_URL}/admin/dashboard" style="color:#1a3c5e;">Admin Dashboard</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

export function applicantApprovedEmail(app: Application): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f7f6;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1b5e20,#2e7d32);padding:40px;text-align:center;">
  <div style="font-size:56px;margin-bottom:16px;">🎉</div>
  <h1 style="color:#fff;margin:0;font-size:28px;">Congratulations!</h1>
  <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Your scholarship has been approved</p>
</td></tr>
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;">Dear <strong>${app.full_name}</strong>,</p>
  <p style="color:#555;font-size:15px;line-height:1.7;">Your scholarship application for <strong style="color:#2e7d32;">Rs.${Number(app.amount_requested).toLocaleString('en-IN')}</strong> has been <strong>approved</strong>.</p>
  <div style="background:#e8f5e9;border-radius:12px;padding:20px;margin:20px 0;">
    <p style="margin:0;font-size:14px;color:#1b5e20;font-weight:600;">Reference: #${app.id.substring(0,8).toUpperCase()}</p>
  </div>
  <p style="color:#555;font-size:15px;line-height:1.7;">Our team will contact you within 5-7 business days regarding fund disbursement.</p>
  <p><a href="${BASE_URL}/status?id=${app.id}" style="color:#1a3c5e;font-weight:600;">Track your application status</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

export function applicantRejectedEmail(app: Application): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f7f6;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#4a1c1c,#7f1d1d);padding:40px;text-align:center;">
  <h1 style="color:#fff;margin:0;font-size:24px;">Application Update</h1>
</td></tr>
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;">Dear <strong>${app.full_name}</strong>,</p>
  <p style="color:#555;font-size:15px;line-height:1.7;">Thank you for applying. After careful review, we regret that we cannot approve your application at this time. We encourage you to reapply in the next cycle.</p>
  <p style="color:#555;font-size:14px;">Reference: <strong>#${app.id.substring(0,8).toUpperCase()}</strong></p>
</td></tr>
</table></td></tr></table></body></html>`;
}

export function applicantSubmissionConfirmationEmail(app: Application): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f7f6;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1a3c5e,#0d47a1);padding:40px;text-align:center;">
  <div style="font-size:48px;margin-bottom:12px;">📬</div>
  <h1 style="color:#fff;margin:0;font-size:24px;">Application Received!</h1>
</td></tr>
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;">Dear <strong>${app.full_name}</strong>,</p>
  <p style="color:#555;font-size:15px;line-height:1.7;">Your application has been submitted. We will review it within 7-10 business days.</p>
  <div style="background:#e3f2fd;border-radius:12px;padding:20px;margin:20px 0;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1565c0;">Reference Number</p>
    <p style="margin:0;font-size:20px;font-weight:700;color:#0d47a1;">#${app.id.substring(0,8).toUpperCase()}</p>
  </div>
  <p><a href="${BASE_URL}/status?id=${app.id}" style="color:#1a3c5e;font-weight:600;">Track your application status</a></p>
</td></tr>
</table></td></tr></table></body></html>`;
}
