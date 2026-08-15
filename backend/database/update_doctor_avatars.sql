-- ============================================
-- UPDATE avatares de los 7 odontólogos
-- Ejecutar sobre la base existente (sin reseed completo)
-- Requiere: migration_multidoctor_fix.sql (columna avatar_url)
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

UPDATE profiles SET avatar_url = v.avatar
FROM (VALUES
  ('profesional@test.com', '/images/doctors/maria-garcia.jpg'),
  ('carlos@test.com',      '/images/doctors/carlos-lopez.jpg'),
  ('lucia@test.com',       '/images/doctors/lucia-fernandez.jpg'),
  ('javier@test.com',      '/images/doctors/javier-ruiz.jpg'),
  ('sofia@test.com',       '/images/doctors/sofia-herrera.jpg'),
  ('martin@test.com',      '/images/doctors/martin-sosa.jpg'),
  ('camila@test.com',      '/images/doctors/camila-duarte.jpg')
) AS v(email, avatar)
WHERE profiles.email = v.email;

-- (opcional) también en users, por si alguna consulta lee de ahí
UPDATE users SET avatar_url = v.avatar
FROM (VALUES
  ('profesional@test.com', '/images/doctors/maria-garcia.jpg'),
  ('carlos@test.com',      '/images/doctors/carlos-lopez.jpg'),
  ('lucia@test.com',       '/images/doctors/lucia-fernandez.jpg'),
  ('javier@test.com',      '/images/doctors/javier-ruiz.jpg'),
  ('sofia@test.com',       '/images/doctors/sofia-herrera.jpg'),
  ('martin@test.com',      '/images/doctors/martin-sosa.jpg'),
  ('camila@test.com',      '/images/doctors/camila-duarte.jpg')
) AS v(email, avatar)
WHERE users.email = v.email;

SELECT '✅ Avatares actualizados' AS resultado;