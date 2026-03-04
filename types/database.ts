// ============================================================
// types/database.ts
// Core TypeScript types for the entire application.
// These mirror the PostgreSQL table structure exactly.
// ============================================================

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface Application {
  id: string;                    // UUID primary key
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  income: number;                // Annual family income in INR/USD
  amount_requested: number;      // Scholarship amount requested
  reason: string;                // Essay / reason for scholarship
  document_url: string | null;   // Supabase Storage URL
  status: ApplicationStatus;
  approval_token: string;        // Cryptographically secure token (SHA-256 hash)
  token_expiry: string;          // ISO 8601 timestamp
  created_at: string;            // ISO 8601 timestamp
  score: number | null;          // Computed priority score (0-100)
  reviewed_at: string | null;    // When admin reviewed
  admin_notes: string | null;    // Internal notes
}

export interface AuditLog {
  id: string;
  application_id: string;
  action: string;                // e.g. "approved", "rejected", "submitted"
  performed_by: string;          // "system", "admin", or admin user id
  details: Record<string, unknown> | null;
  created_at: string;
}

// Form submission shape (before DB insertion)
export interface ApplicationFormData {
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  income: number;
  amount_requested: number;
  reason: string;
  declaration: boolean;
}

// Dashboard filter state
export interface ApplicationFilters {
  status?: ApplicationStatus | 'all';
  search?: string;
  page: number;
  per_page: number;
}

// Paginated response
export interface PaginatedApplications {
  data: Application[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
