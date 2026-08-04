-- ============================================
-- Migration: Multi-doctor (servicio ofrecido por varios odontólogos)
-- Ejecutar DESPUÉS de migration_jwt_auth.sql
-- Additiva, no destructiva
-- ============================================

-- 1. Tabla puente: servicio <-> profesionales (muchos a muchos)
CREATE TABLE IF NOT EXISTS service_professionals (
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (service_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_service_professionals_professional
  ON service_professionals(professional_id);

-- 2. Poblar desde services.professional_id (preserva el vínculo actual)
INSERT INTO service_professionals (service_id, professional_id)
SELECT id, professional_id FROM services
WHERE professional_id IS NOT NULL
ON CONFLICT (service_id, professional_id) DO NOTHING;

-- 3. Columnas para título y especialidad en profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty TEXT;