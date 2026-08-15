-- ============================================
-- SEED DATA - ODONTOLOGÍA (JWT Auth + SaaS Multi-Tenant)
-- ============================================
-- Run this AFTER executing migration_jwt_auth.sql
-- Creates/updates a test professional user with password: Test1234!

DO $$
DECLARE
  v_user_id UUID;
  v_business_id UUID;
  v_password_hash TEXT := '$2b$12$IeQpbO.xueO7NxGtdJ/F6.XPcdpkDu/4AVQI12fYp27Hd5bh8XuPG';
  v_existing_profile_id UUID;
BEGIN
  -- 1. Check if profile with this email already exists
  SELECT id INTO v_existing_profile_id FROM profiles WHERE email = 'profesional@test.com';

  IF v_existing_profile_id IS NOT NULL THEN
    -- Use existing profile id
    v_user_id := v_existing_profile_id;

    -- Update users table
    INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
    VALUES (v_user_id, 'profesional@test.com', v_password_hash, 'professional', 'Dra. María García', '+5491112345678', true)
    ON CONFLICT (id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role,
      is_active = EXCLUDED.is_active;

    -- Update profile
    UPDATE profiles SET
      full_name = 'Dra. María García',
      phone = '+5491112345678',
      role = 'professional',
      bio = 'Odontóloga especializada en estética dental con más de 10 años de experiencia.',
      avatar_url = '/images/doctors/maria-garcia.jpg',
      is_verified = true,
      onboarding_completed = true
    WHERE id = v_user_id;
  ELSE
    -- Create new user and profile
    v_user_id := gen_random_uuid();

    INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
    VALUES (v_user_id, 'profesional@test.com', v_password_hash, 'professional', 'Dra. María García', '+5491112345678', true);

    INSERT INTO profiles (id, email, full_name, phone, role, bio, avatar_url, is_verified, onboarding_completed)
    VALUES (v_user_id, 'profesional@test.com', 'Dra. María García', '+5491112345678', 'professional', 'Odontóloga especializada en estética dental con más de 10 años de experiencia.', '/images/doctors/maria-garcia.jpg', true, true);
  END IF;

  -- 2. Clean old data
  DELETE FROM notifications WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = v_user_id);
  DELETE FROM payments WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = v_user_id);
  DELETE FROM appointments WHERE professional_id = v_user_id;
  DELETE FROM services WHERE professional_id = v_user_id;
  DELETE FROM schedules WHERE professional_id = v_user_id;
  DELETE FROM businesses WHERE owner_id = v_user_id;

  -- 3. Create business
  INSERT INTO businesses (owner_id, name, slug, category, tagline, description, primary_color, secondary_color, currency, timezone, whatsapp_number, is_active) VALUES
    (v_user_id, 'Clínica Dental Sonrisa', 'sonrisa', 'odontologia', 'Tu sonrisa, nuestra prioridad', 'Centro odontológico especializado en tratamientos de estética, implantes y ortodoncia.', '#0f172a', '#3b82f6', 'USD', 'America/Argentina/Buenos_Aires', '+5491112345678', true);

  SELECT id INTO v_business_id FROM businesses WHERE owner_id = v_user_id LIMIT 1;

  -- 4. Insert services (odontología)
  INSERT INTO services (business_id, professional_id, name, description, duration_min, price_cents, currency, is_active) VALUES
    (v_business_id, v_user_id, 'Consulta General', 'Evaluación completa de salud bucal', 30, 5000, 'USD', true),
    (v_business_id, v_user_id, 'Limpieza Dental', 'Limpieza profesional con ultrasonido', 45, 8000, 'USD', true),
    (v_business_id, v_user_id, 'Blanqueamiento', 'Blanqueamiento LED profesional', 60, 15000, 'USD', true),
    (v_business_id, v_user_id, 'Ortodoncia - Control', 'Seguimiento de tratamiento de ortodoncia', 20, 3000, 'USD', true),
    (v_business_id, v_user_id, 'Extracción Simple', 'Extracción de pieza dental', 45, 10000, 'USD', true),
    (v_business_id, v_user_id, 'Implante Dental', 'Colocación de implante dental', 90, 25000, 'USD', true),
    (v_business_id, v_user_id, 'Endodoncia', 'Tratamiento de conducto', 60, 18000, 'USD', true),
    (v_business_id, v_user_id, 'Carillas de Porcelana', 'Diseño de sonrisa con carillas', 120, 35000, 'USD', true);

  -- 5. Insert schedules (Monday-Friday)
  INSERT INTO schedules (business_id, professional_id, day_of_week, start_time, end_time, is_active) VALUES
    (v_business_id, v_user_id, 1, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 2, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 3, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 4, '09:00:00', '18:00:00', true),
    (v_business_id, v_user_id, 5, '09:00:00', '14:00:00', true);

  -- 6. Insert sample appointments
  INSERT INTO appointments (business_id, professional_id, service_id, client_name, client_email, client_phone, start_at, end_at, status)
  VALUES
    -- Existing
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Consulta General' LIMIT 1), 'Juan Pérez', 'juan@example.com', '+5491198765432', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 30 minutes', 'confirmed'),
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Blanqueamiento' LIMIT 1), 'Ana López', 'ana@example.com', '+5491187654321', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 60 minutes', 'paid'),
    -- Past paid (last week)
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Limpieza Dental' LIMIT 1), 'Carlos Mendoza', 'carlos@ejemplo.com', '+5491122334455', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days 45 minutes', 'paid'),
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Consulta General' LIMIT 1), 'Laura Fernández', 'laura@ejemplo.com', '+5491133445566', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days 30 minutes', 'paid'),
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Extracción Simple' LIMIT 1), 'Pedro Ramírez', 'pedro@ejemplo.com', '+5491144556677', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days 45 minutes', 'paid'),
    -- Past cancelled
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Ortodoncia - Control' LIMIT 1), 'Sofía Torres', 'sofia@ejemplo.com', '+5491155667788', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days 20 minutes', 'cancelled'),
    -- Today confirmed
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Limpieza Dental' LIMIT 1), 'Diego Martínez', 'diego@ejemplo.com', '+5491166778899', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours 45 minutes', 'confirmed'),
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Consulta General' LIMIT 1), 'Valentina Ruiz', 'valentina@ejemplo.com', '+5491177889900', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '4 hours 30 minutes', 'confirmed'),
    -- Tomorrow
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Endodoncia' LIMIT 1), 'Martín Díaz', 'martin@ejemplo.com', '+5491188990011', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 60 minutes', 'pending'),
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Implante Dental' LIMIT 1), 'Camila Gómez', 'camila@ejemplo.com', '+5491199001122', NOW() + INTERVAL '1 day 3 hours', NOW() + INTERVAL '1 day 4 hours 30 minutes', 'confirmed'),
    -- Next week
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Carillas de Porcelana' LIMIT 1), 'Lucas Castro', 'lucas@ejemplo.com', '+5491100112233', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 120 minutes', 'pending'),
    (v_business_id, v_user_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Blanqueamiento' LIMIT 1), 'Florencia Vargas', 'florencia@ejemplo.com', '+5491111223344', NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days 60 minutes', 'confirmed');

  -- 7. Insert payments for all paid appointments (including the new ones)
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

  -- 8. Insert notifications for all confirmed and paid appointments
  INSERT INTO notifications (appointment_id, type, channel, status, sent_at)
  SELECT 
    a.id,
    CASE WHEN a.status = 'paid' THEN 'confirmation' ELSE 'reminder' END,
    'whatsapp',
    'sent',
    a.created_at
  FROM appointments a
  WHERE a.status IN ('confirmed', 'paid')
    AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.appointment_id = a.id AND n.type = CASE WHEN a.status = 'paid' THEN 'confirmation' ELSE 'reminder' END);

  -- 9. Ensure profiles role constraint allows 'client' (fixes "profiles_role_check" violation)
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'professional', 'admin'));

  -- 10. Create client test user (for client login testing) — no profile needed
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'cliente@test.com') THEN
    INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
    VALUES (gen_random_uuid(), 'cliente@test.com', v_password_hash, 'client', 'Juan Pérez', '+5491111111111', true);
  END IF;

  RAISE NOTICE 'Seed completed. Professional ID: %', v_user_id;
  RAISE NOTICE 'Login profesional: profesional@test.com / Test1234!';
  RAISE NOTICE 'Login cliente:      cliente@test.com / Test1234!';
END $$;
