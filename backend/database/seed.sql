-- ============================================
-- SEED DATA - ODONTOLOGÍA (SaaS Multi-Tenant)
-- ============================================
-- Run this AFTER creating a professional user via Supabase Auth
-- Replace '967da116-11d2-4d11-9c3d-2ae606c697b5' with actual UUID from auth.users

DO $$
DECLARE
  v_business_id UUID;
  v_professional_id UUID := '967da116-11d2-4d11-9c3d-2ae606c697b5';
BEGIN
  -- 1. Update profile
  UPDATE profiles 
  SET 
    full_name = 'Dra. María García',
    phone = '+5491112345678',
    role = 'professional',
    bio = 'Odontóloga especializada en estética dental con más de 10 años de experiencia.',
    is_verified = true,
    onboarding_completed = true
  WHERE id = v_professional_id;

  -- 2. Clean old data
  DELETE FROM notifications WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = v_professional_id);
  DELETE FROM payments WHERE appointment_id IN (SELECT id FROM appointments WHERE professional_id = v_professional_id);
  DELETE FROM appointments WHERE professional_id = v_professional_id;
  DELETE FROM services WHERE professional_id = v_professional_id;
  DELETE FROM schedules WHERE professional_id = v_professional_id;
  DELETE FROM businesses WHERE owner_id = v_professional_id;

  -- 3. Create business
  INSERT INTO businesses (owner_id, name, slug, category, tagline, description, primary_color, secondary_color, currency, timezone, whatsapp_number, is_active) VALUES
    (v_professional_id, 'Clínica Dental Sonrisa', 'sonrisa', 'odontologia', 'Tu sonrisa, nuestra prioridad', 'Centro odontológico especializado en tratamientos de estética, implantes y ortodoncia.', '#0f172a', '#3b82f6', 'USD', 'America/Argentina/Buenos_Aires', '+5491112345678', true);

  SELECT id INTO v_business_id FROM businesses WHERE owner_id = v_professional_id LIMIT 1;

  -- 4. Insert services (odontología)
  INSERT INTO services (business_id, professional_id, name, description, duration_min, price_cents, currency, is_active) VALUES
    (v_business_id, v_professional_id, 'Consulta General', 'Evaluación completa de salud bucal', 30, 5000, 'USD', true),
    (v_business_id, v_professional_id, 'Limpieza Dental', 'Limpieza profesional con ultrasonido', 45, 8000, 'USD', true),
    (v_business_id, v_professional_id, 'Blanqueamiento', 'Blanqueamiento LED profesional', 60, 15000, 'USD', true),
    (v_business_id, v_professional_id, 'Ortodoncia - Control', 'Seguimiento de tratamiento de ortodoncia', 20, 3000, 'USD', true),
    (v_business_id, v_professional_id, 'Extracción Simple', 'Extracción de pieza dental', 45, 10000, 'USD', true),
    (v_business_id, v_professional_id, 'Implante Dental', 'Colocación de implante dental', 90, 25000, 'USD', true),
    (v_business_id, v_professional_id, 'Endodoncia', 'Tratamiento de conducto', 60, 18000, 'USD', true),
    (v_business_id, v_professional_id, 'Carillas de Porcelana', 'Diseño de sonrisa con carillas', 120, 35000, 'USD', true);

  -- 5. Insert schedules (Monday-Friday)
  INSERT INTO schedules (business_id, professional_id, day_of_week, start_time, end_time, is_active) VALUES
    (v_business_id, v_professional_id, 1, '09:00:00', '18:00:00', true),
    (v_business_id, v_professional_id, 2, '09:00:00', '18:00:00', true),
    (v_business_id, v_professional_id, 3, '09:00:00', '18:00:00', true),
    (v_business_id, v_professional_id, 4, '09:00:00', '18:00:00', true),
    (v_business_id, v_professional_id, 5, '09:00:00', '14:00:00', true);

  -- 6. Insert sample appointments
  INSERT INTO appointments (business_id, professional_id, service_id, client_name, client_email, client_phone, start_at, end_at, status)
  VALUES
    (v_business_id, v_professional_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Consulta General' LIMIT 1), 'Juan Pérez', 'juan@example.com', '+5491198765432', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 30 minutes', 'confirmed'),
    (v_business_id, v_professional_id, (SELECT id FROM services WHERE business_id = v_business_id AND name = 'Blanqueamiento' LIMIT 1), 'Ana López', 'ana@example.com', '+5491187654321', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 60 minutes', 'paid');

  -- 7. Insert sample payments
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

  -- 8. Insert sample notifications
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

END $$;
