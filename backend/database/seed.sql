-- ============================================
-- SEED — resetea todo y crea datos de prueba
-- Ejecutar DESPUÉS de migration_jwt_auth.sql
-- ============================================
-- Login profesional: profesional@test.com / Test1234!
-- Login cliente:      cliente@test.com / Test1234!

-- Asegurar que profiles acepte todos los roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'professional', 'admin'));

-- Password hash de "Test1234!"
-- (bcrypt hash generado, mismo para ambos usuarios)
DO $$
DECLARE
  v_pw TEXT := '$2b$12$IeQpbO.xueO7NxGtdJ/F6.XPcdpkDu/4AVQI12fYp27Hd5bh8XuPG';
  v_pro_id UUID;
  v_cli_id UUID;
  v_biz_id UUID;
BEGIN

--------------------------------------------------------------------------------
-- USUARIO PROFESIONAL
--------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
VALUES (gen_random_uuid(), 'profesional@test.com', v_pw, 'professional', 'Dra. María García', '+5491112345678', true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = v_pw,
  role          = 'professional',
  full_name     = 'Dra. María García',
  phone         = '+5491112345678',
  is_active     = true;

INSERT INTO profiles (id, email, full_name, phone, role, bio, is_verified, onboarding_completed)
SELECT id, email, full_name, phone, role, 'Odontóloga especializada en estética dental con más de 10 años de experiencia.', true, true
FROM users WHERE email = 'profesional@test.com'
ON CONFLICT (id) DO UPDATE SET
  email              = EXCLUDED.email,
  full_name          = EXCLUDED.full_name,
  phone              = EXCLUDED.phone,
  role               = EXCLUDED.role,
  bio                = EXCLUDED.bio,
  is_verified        = true,
  onboarding_completed = true;

--------------------------------------------------------------------------------
-- USUARIO CLIENTE
--------------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
VALUES (gen_random_uuid(), 'cliente@test.com', v_pw, 'client', 'Juan Pérez', '+5491111111111', true)
ON CONFLICT (email) DO NOTHING;

--------------------------------------------------------------------------------
-- LIMPIAR DATA ANTERIOR
--------------------------------------------------------------------------------
DELETE FROM notifications WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = (SELECT id FROM users WHERE email = 'profesional@test.com'));
DELETE FROM payments       WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = (SELECT id FROM users WHERE email = 'profesional@test.com'));
DELETE FROM appointments   WHERE professional_id   = (SELECT id FROM users WHERE email = 'profesional@test.com');
DELETE FROM services       WHERE professional_id   = (SELECT id FROM users WHERE email = 'profesional@test.com');
DELETE FROM schedules      WHERE professional_id   = (SELECT id FROM users WHERE email = 'profesional@test.com');
DELETE FROM businesses     WHERE owner_id          = (SELECT id FROM users WHERE email = 'profesional@test.com');

--------------------------------------------------------------------------------
-- BUSINESS
--------------------------------------------------------------------------------
INSERT INTO businesses (owner_id, name, slug, category, tagline, description, primary_color, secondary_color, currency, timezone, whatsapp_number, is_active)
SELECT id, 'Clínica Dental Sonrisa', 'sonrisa', 'odontologia', 'Tu sonrisa, nuestra prioridad', 'Centro odontológico especializado en tratamientos de estética, implantes y ortodoncia.', '#0f172a', '#3b82f6', 'USD', 'America/Argentina/Buenos_Aires', '+5491112345678', true
FROM users WHERE email = 'profesional@test.com';

--------------------------------------------------------------------------------
-- SERVICES
--------------------------------------------------------------------------------
INSERT INTO services (business_id, professional_id, name, description, duration_min, price_cents, currency, is_active)
SELECT b.id, u.id, s.name, s.descrip, s.dur, s.price, 'USD', true
FROM users u
JOIN businesses b ON b.owner_id = u.id, (VALUES
  ('Consulta General',       'Evaluación completa de salud bucal',                             30,  5000),
  ('Limpieza Dental',        'Limpieza profesional con ultrasonido',                           45,  8000),
  ('Blanqueamiento',         'Blanqueamiento LED profesional',                                 60, 15000),
  ('Ortodoncia - Control',   'Seguimiento de tratamiento de ortodoncia',                       20,  3000),
  ('Extracción Simple',      'Extracción de pieza dental',                                     45, 10000),
  ('Implante Dental',        'Colocación de implante dental',                                  90, 25000),
  ('Endodoncia',             'Tratamiento de conducto',                                         60, 18000),
  ('Carillas de Porcelana',  'Diseño de sonrisa con carillas',                                 120, 35000)
) AS s(name, descrip, dur, price)
WHERE u.email = 'profesional@test.com';

--------------------------------------------------------------------------------
-- SCHEDULES
--------------------------------------------------------------------------------
INSERT INTO schedules (business_id, professional_id, day_of_week, start_time, end_time, is_active)
SELECT b.id, u.id, d.day, d.start, d.end, true
FROM users u
JOIN businesses b ON b.owner_id = u.id, (VALUES
  (1, '09:00:00'::time, '18:00:00'::time),
  (2, '09:00:00',       '18:00:00'),
  (3, '09:00:00',       '18:00:00'),
  (4, '09:00:00',       '18:00:00'),
  (5, '09:00:00',       '14:00:00')
) AS d(day, start, end)
WHERE u.email = 'profesional@test.com';

--------------------------------------------------------------------------------
-- APPOINTMENTS (12 con estados variados)
--------------------------------------------------------------------------------
INSERT INTO appointments (business_id, professional_id, service_id, client_name, client_email, client_phone, start_at, end_at, status)
SELECT
  b.id,
  u.id,
  svc.id,
  a.name, a.email, a.phone,
  a.start, a.start + (svc.duration_min * interval '1 minute'),
  a.status
FROM users u
JOIN businesses b ON b.owner_id = u.id
JOIN LATERAL (VALUES
  -- pasados (pagos)
  ('Carlos Mendoza',   'carlos@ejemplo.com',    '+5491122334455', NOW() - interval '7 days',  'paid'),
  ('Laura Fernández',  'laura@ejemplo.com',     '+5491133445566', NOW() - interval '5 days',  'paid'),
  ('Pedro Ramírez',    'pedro@ejemplo.com',     '+5491144556677', NOW() - interval '3 days',  'paid'),
  -- pasado cancelado
  ('Sofía Torres',     'sofia@ejemplo.com',     '+5491155667788', NOW() - interval '2 days',  'cancelled'),
  -- hoy
  ('Diego Martínez',   'diego@ejemplo.com',     '+5491166778899', NOW() + interval '2 hours', 'confirmed'),
  ('Valentina Ruiz',   'valentina@ejemplo.com', '+5491177889900', NOW() + interval '4 hours', 'confirmed'),
  -- mañana
  ('Martín Díaz',      'martin@ejemplo.com',    '+5491188990011', NOW() + interval '1 day',   'pending'),
  ('Camila Gómez',     'camila@ejemplo.com',    '+5491199001122', NOW() + interval '1 day 3 hours', 'confirmed'),
  -- próximos días
  ('Juan Pérez',       'juan@example.com',      '+5491198765432', NOW() + interval '2 days',  'confirmed'),
  ('Ana López',        'ana@example.com',       '+5491187654321', NOW() + interval '3 days',  'paid'),
  -- semana que viene
  ('Lucas Castro',     'lucas@ejemplo.com',     '+5491100112233', NOW() + interval '7 days',  'pending'),
  ('Florencia Vargas', 'florencia@ejemplo.com', '+5491111223344', NOW() + interval '8 days',  'confirmed')
) AS a(name, email, phone, start, status)
JOIN LATERAL (
  SELECT id, duration_min FROM services
  WHERE professional_id = u.id
  ORDER BY random() LIMIT 1
) svc ON true
WHERE u.email = 'profesional@test.com';

--------------------------------------------------------------------------------
-- PAYMENTS (para servicios con status = 'paid')
--------------------------------------------------------------------------------
INSERT INTO payments (appointment_id, stripe_payment_intent_id, amount_cents, currency, status, paid_at)
SELECT
  a.id,
  'pi_test_' || a.id,
  COALESCE(s.price_cents, 0),
  'USD',
  'succeeded',
  a.end_at
FROM appointments a
JOIN services s ON s.id = a.service_id
WHERE a.status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.appointment_id = a.id);

--------------------------------------------------------------------------------
-- NOTIFICATIONS (para confirmed y paid)
--------------------------------------------------------------------------------
INSERT INTO notifications (appointment_id, type, channel, status, sent_at)
SELECT
  a.id,
  CASE WHEN a.status = 'paid' THEN 'confirmation' ELSE 'reminder' END,
  'whatsapp',
  'sent',
  a.created_at
FROM appointments a
WHERE a.status IN ('confirmed', 'paid')
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.appointment_id = a.id
      AND n.type = CASE WHEN a.status = 'paid' THEN 'confirmation' ELSE 'reminder' END
  );

END $$;

--------------------------------------------------------------------------------
-- VERIFICACIÓN
--------------------------------------------------------------------------------
SELECT '✅ Seed completado' AS resultado;
SELECT 'profesional@test.com / Test1234!' AS profesional;
SELECT 'cliente@test.com / Test1234!' AS cliente;
SELECT COUNT(*) || ' appointments' AS datos FROM appointments;
SELECT COUNT(*) || ' payments'      FROM payments;
SELECT COUNT(*) || ' notifications'  FROM notifications;
