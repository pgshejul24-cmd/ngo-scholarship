import { createAdminClient } from './supabase/server';

export async function createAuditLog({
  applicationId,
  action,
  performedBy,
  details,
}: {
  applicationId: string;
  action: string;
  performedBy: string;
  details?: string;
}) {
  const supabase = createAdminClient();
  await supabase.from('audit_logs').insert({
    application_id: applicationId,
    action,
    performed_by: performedBy,
    details: details || null,
  });
}
