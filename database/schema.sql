-- =============================================
-- NGO SCHOLARSHIP MANAGEMENT SYSTEM
-- PostgreSQL Schema for Supabase
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email            TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone            TEXT NOT NULL,
  address          TEXT NOT NULL,
  income           NUMERIC(12, 2) NOT NULL CHECK (income >= 0),
  amount_requested NUMERIC(12, 2) NOT NULL CHECK (amount_requested >= 1000),
  reason           TEXT NOT NULL,
  document_url     TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_token   TEXT NOT NULL,
  token_expiry     TIMESTAMPTZ NOT NULL,
  score            INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_status     ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email      ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  action         TEXT NOT NULL,
  performed_by   TEXT NOT NULL,
  details        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_app_id ON audit_logs(application_id);

-- Admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles  ENABLE ROW LEVEL SECURITY;

-- Only service_role (backend) can insert/read/update applications
-- Authenticated admins can read via service_role bypass in API routes
-- No direct public access to application data

-- Admins can read their own role
CREATE POLICY "Users can read own role" ON admin_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- =============================================
-- After creating first admin user in Supabase Auth:
-- INSERT INTO admin_roles (user_id, role)
-- VALUES ('<uuid-from-auth.users>', 'super_admin');
-- =============================================
