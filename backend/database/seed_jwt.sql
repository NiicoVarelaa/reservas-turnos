-- ============================================
-- SEED DATA - ODONTOLOGÍA (JWT Auth + SaaS Multi-Tenant)
-- ============================================
-- Run this AFTER executing migration_jwt_auth.sql
-- Creates a test professional user with password: Test1234!

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_business_id UUID;
  v_password_hash TEXT;
BEGIN
  -- 1. Hash password (bcrypt hash of 'Test1234!')
  -- In production, use bcrypt to generate this. This is a pre-computed hash for seeding.
  v_password_hash := '$2b$12$IeQpbO.xueO7NxGtdJ/F6.XPcdpkDu/4AVQI12fYp27Hd5bh8XuPG';

  -- 2. Create user in users table
  INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
  VALUES (
    v_user_id,
    'profesional@test.com',
    v_password_hash,
    'professional',
    'Dra. María García',
    '+5491112345678',
    true
  )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Create/update profile
  INSERT INTO profiles (id, email, full_name, phone, role, bio, is_verified, onboarding_completed)
  VALUES (
    v_user_id,
    'profesional@test.com',
    'Dra. María García',
    '+5491112345678',
    'professional',
    'Odontóloga especializada en estética dental con más de 10 años de experiencia.',
    true,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    is_verified = EXCLUDED.is_verified,
    onboarding_completed = EXCLUDED.onboarding_completed;

  -- 4. Clean old data
  DELETE FROM notifications WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = v_user_id);
  DELETE FROM payments WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = v_user_id);
  DELETE FROM appointments WHERE professional_id = v_user_id;
  DELETE FROM services WHERE professional_id = v_user_id;
  DELETE FROM schedules WHERE professional_id = v_user_id;
  DELETE FROM businesses WHERE owner_id = v_user_id;

  -- 5. Create business
  INSERT INTO businesses (owner_id, name, slug, category, tagline, description, primary_color, secondary_color, currency, timezone, whatsapp_number, is_active) VALUES
    (v_user_id, 'Clínica Dental Sonrisa', 'sonrisa', 'odontologia', 'Tu sonrisa, nuestra prioridad', 'Centro odontológico especializado en tratamientos de estética, implantes y ortodoncia.', '#0f172a', '#3b82f6', 'USD', 'America/Argentina/Buenos_Aires', '+5491112345678', true);

  SELECT id INTO v_business_id FROM businesses WHERE owner_id = v_user_id LIMIT 1;

  -- 6. Insert services (odontología)
  INSERT INTO services (business_id, professional_id, name, description, duration_min, price_cents, currency, is_active) VALUES
    (v_business_id, v_user_id, 'Consulta General', 'Evaluación completa de salud bucal', 30, 5000, 'USD', true),
    (v_business_id, v_user_id, 'Limpieza Dental', 'Limpieza profesional con ultrasonido', 45, 8000, 'USD', true),
    (v_business_id, v_user_id, 'Blanqueamiento', 'Blanqueamiento LED profesional', 60, 15000, 'USD', true),
    (v_business_id, v_user_id, 'Ortodoncia - Control', 'Seguimiento de tratamiento de ortodoncia', 20, 3000, 'USD', true),
    (v_business_id, v_user_id, 'Extracción Simple', 'Extracción de pieza dental', 45, 10000, 'USD', true),
    (v_business_id, v_user_id, 'Implante Dental', 'Colocación de implante dental', 90, 25000, 'USD', true),
    (v_business_id, v_user_id, 'Endodoncia', 'Tratamiento de conducto', 60, 18000, 'USD', true),
    (v_business_id, v_user_id, 'Carillas de Porcelana', 'Diseño de sonrisa con carillas', 120, 35000, 'USD', true);

  -- 7. Insert schedules (Monday-Friday)
  INSERT INTO schedules (business_id, professional_id, day_of_week, start_time, end_time, is_active) VALUES
    (v_business_id, v_user_id, 1, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 2, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 3, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 4, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 5, '09:00:00', '14:00:00', true);

  -- 8. Insert sample appointments
  INSERT INTO appointments (business_id, professional_id, service_id, client_name, client_email, client_phone, start_at, end_at, status)
  VALUES
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Consulta General' LIMIT 1), 'Juan Pérez', 'juan@example.com', '+5491198765432', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 30 minutes', 'confirmed'),
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Blanqueamiento' LIMIT 1), 'Ana López', 'ana@example.com', '+5491187654321', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 60 minutes', 'paid');

  -- 9. Insert sample payments
  INSERT INTO payments (appointment_id, stripe_payment_intent_id, amount_cents, currency, status, paid_at)
  SELECT 
    id,
    'pi_test_' || id,
    15000,
    'USD',
    'succeeded',
    NOW()
  FROM appointments 
  WHERE status = 'paid' 
  LIMIT 1;

  -- 10. Insert sample notifications
  INSERT INTO notifications (appointment_id, type, channel, status, sent_at)
  SELECT 
    id,
    'confirmation',
    'whatsapp',
    'sent',
    NOW()
  FROM appointments 
  WHERE status IN ('confirmed', 'paid')
  LIMIT 2;

  RAISE NOTICE 'Seed completed. User ID: %', v_user_id;
  RAISE NOTICE 'Login with: profesional@test.com / Test1234!';
END $$;
