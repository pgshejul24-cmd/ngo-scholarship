export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  income: number;
  amount_requested: number;
  reason: string;
  document_url: string | null;
  status: ApplicationStatus;
  approval_token: string;
  token_expiry: string;
  created_at: string;
  score?: number;
  audit_logs?: AuditLog[];
}

export interface AuditLog {
  id: string;
  application_id: string;
  action: string;
  performed_by: string;
  details: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
}
