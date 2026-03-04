-- ============================================================
-- NGO Scholarship System - Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor (once, in order)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name         TEXT NOT NULL CHECK (length(full_name) BETWEEN 2 AND 100),
  email             TEXT NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone             TEXT NOT NULL,
  address           TEXT,
  income            NUMERIC(12, 2) NOT NULL CHECK (income >= 0),
  amount_requested  NUMERIC(12, 2) NOT NULL CHECK (amount_requested > 0),
  reason            TEXT NOT NULL CHECK (length(reason) >= 50),
  document_url      TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_token    TEXT NOT NULL,        -- SHA-256 hashed token
  token_expiry      TIMESTAMPTZ NOT NULL,
  score             INTEGER CHECK (score BETWEEN 0 AND 100),
  reviewed_at       TIMESTAMPTZ,
  admin_notes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_score ON applications(score DESC);

-- ============================================================
-- TABLE: audit_logs (append-only, no updates/deletes)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  performed_by    TEXT NOT NULL DEFAULT 'system',
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_application_id ON audit_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Applications: publicly insertable, only service role can read/update
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT (public form submission)
CREATE POLICY "public_can_submit_applications"
  ON applications FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow users to check their own application status (read-only, limited fields)
-- We expose status check via a secure API route, not direct RLS access.
-- Service role bypasses RLS - used by admin API routes.

-- Audit logs: insert only via service role
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SUPABASE STORAGE SETUP
-- (Run these after creating the bucket in Storage UI)
-- ============================================================

-- Create bucket via Storage UI first, then:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'scholarship-documents',
--   'scholarship-documents',
--   false,                                    -- Private bucket
--   5242880,                                  -- 5MB limit
--   ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
-- );

-- Storage RLS: only service role can read uploaded documents
-- (Admin uses signed URLs generated server-side)
-- INSERT INTO storage.policies ... (configured via Supabase UI)

-- ============================================================
-- FUNCTION: Prevent approval_token from being read via anon key
-- ============================================================
-- The approval_token column is never exposed via anon queries
-- because all admin operations use the service role key.
-- As an extra safeguard:

CREATE OR REPLACE FUNCTION redact_token_for_anon()
RETURNS TRIGGER AS $$
BEGIN
  NEW.approval_token = '[REDACTED]';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- USEFUL ADMIN QUERIES
-- ============================================================

-- View all pending applications sorted by score
-- SELECT id, full_name, email, income, amount_requested, score, created_at
-- FROM applications
-- WHERE status = 'pending'
-- ORDER BY score DESC, created_at ASC;

-- View audit trail for an application
-- SELECT action, performed_by, details, created_at
-- FROM audit_logs
-- WHERE application_id = 'YOUR-APPLICATION-UUID'
-- ORDER BY created_at ASC;

-- Export pending applications
-- SELECT full_name, email, phone, income, amount_requested, reason, score
-- FROM applications
-- WHERE status = 'pending'
-- ORDER BY score DESC;
