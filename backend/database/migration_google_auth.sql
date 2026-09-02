-- ==========================================
-- Migration: Google OAuth via Supabase Auth
-- ==========================================
-- Purpose: Enable Google sign-up/sign-in using Supabase Auth,
--          syncing auth.users into the custom `users` table.
-- Date: 2026-09-02

-- 1. Allow users without a password (Google accounts)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Add provider columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'email' CHECK (provider IN ('email', 'google'));

-- 3. Helper to map a Supabase Auth user into the custom users table
CREATE OR REPLACE FUNCTION sync_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  full_name TEXT := raw_meta->>'full_name';
  avatar TEXT := raw_meta->>'avatar_url';
  provider_name TEXT := COALESCE(
    (raw_meta->>'provider'),
    (SELECT provider FROM jsonb_array_elements_text(COALESCE(NEW.app_metadata, '{}'::jsonb)->'providers') AS p LIMIT 1),
    'email'
  );
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO users (id, email, password_hash, full_name, avatar_url, provider, is_active)
    VALUES (NEW.id, NEW.email, NULL, full_name, avatar, provider_name, true)
    ON CONFLICT (email) DO UPDATE
      SET full_name = COALESCE(EXCLUDED.full_name, users.full_name),
          avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
          provider = CASE
                       WHEN users.provider = 'email' THEN EXCLUDED.provider
                       ELSE users.provider
                     END,
          updated_at = NOW();
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE users
    SET full_name = COALESCE(raw_meta->>'full_name', users.full_name),
        avatar_url = COALESCE(raw_meta->>'avatar_url', users.avatar_url),
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to keep users.y synced when a Supabase Auth user is created/updated
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user();

-- 5. Ensure service role can read auth.users for token verification (helper)
-- The supabase service role can query auth.users directly when using the admin client.
