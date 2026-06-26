-- ==========================================
-- Migration: JWT Auth with Users & Refresh Tokens
-- ==========================================
-- Purpose: Replace Supabase Auth with custom JWT authentication
-- Date: 2026-06-02

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'professional', 'admin')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Migrate existing profiles to users table (if any)
-- This copies email/password_hash from existing auth if needed
-- Skip if starting fresh

-- 6. Helper functions
CREATE OR REPLACE FUNCTION get_user_by_email(p_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  password_hash TEXT,
  role TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.password_hash, u.role, u.full_name, u.phone, u.avatar_url, u.is_active, u.created_at, u.updated_at
  FROM users u
  WHERE u.email = p_email AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_refresh_token(p_user_id UUID, p_token TEXT, p_expires_at TIMESTAMPTZ)
RETURNS refresh_tokens AS $$
DECLARE
  new_token refresh_tokens;
BEGIN
  INSERT INTO refresh_tokens (user_id, token, expires_at)
  VALUES (p_user_id, p_token, p_expires_at)
  RETURNING * INTO new_token;
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_valid_refresh_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  token TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT rt.id, rt.user_id, rt.token, rt.expires_at, rt.revoked_at, rt.created_at
  FROM refresh_tokens rt
  WHERE rt.token = p_token
    AND rt.revoked_at IS NULL
    AND rt.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION revoke_refresh_token(p_token TEXT)
RETURNS void AS $$
BEGIN
  UPDATE refresh_tokens
  SET revoked_at = NOW()
  WHERE token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION revoke_all_user_tokens(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE refresh_tokens
  SET revoked_at = NOW()
  WHERE user_id = p_user_id AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
