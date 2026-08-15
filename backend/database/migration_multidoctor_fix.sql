-- ============================================
-- Migration: Fix FK profiles.id -> users.id (JWT custom)
-- Reemplaza el vínculo heredado a auth.users por nuestra tabla users.
-- Ejecutar DESPUÉS de migration_multidoctor.sql y ANTES de seed.sql
-- ============================================

-- 1. Eliminar perfil huérfano (no tiene fila en users)
DELETE FROM profiles
WHERE id = '876b859f-1f0f-4e06-a4ff-0987afea721d';

-- 2. Repuntar FK: profiles.id -> users.id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Garantizar columna de avatar en profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;