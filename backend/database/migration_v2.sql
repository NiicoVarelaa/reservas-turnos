-- ============================================
-- MIGRATION V2: SaaS Multi-Tenant
-- Run this on your EXISTING Supabase database
-- ============================================

-- 1. Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'odontologia', 'medicina', 'belleza', 'peluqueria',
    'psicologia', 'veterinaria', 'fitness', 'educacion',
    'legal', 'consultoria', 'general'
  )),
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0f172a',
  secondary_color TEXT DEFAULT '#3b82f6',
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  whatsapp_number TEXT,
  address TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add business_id columns to existing tables
ALTER TABLE services ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id);

-- 3. Add onboarding_completed to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_schedules_business ON schedules(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments(business_id);

-- 5. Enable RLS on businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for businesses
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
CREATE POLICY "Anyone can view active businesses" ON businesses
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Businesses can be created by authenticated users" ON businesses;
CREATE POLICY "Businesses can be created by authenticated users" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own business" ON businesses;
CREATE POLICY "Owners can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- 7. Update existing RLS policies to use business_id
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Business owners can manage services" ON services;
CREATE POLICY "Business owners can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = services.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can view active schedules" ON schedules;
CREATE POLICY "Anyone can view active schedules" ON schedules
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Business owners can manage schedules" ON schedules;
CREATE POLICY "Business owners can manage schedules" ON schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = schedules.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Business owners can view own appointments" ON appointments;
CREATE POLICY "Business owners can view own appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can update own appointments" ON appointments;
CREATE POLICY "Business owners can update own appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can view payments" ON payments;
CREATE POLICY "Business owners can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN businesses b ON b.id = a.business_id
      WHERE a.id = payments.appointment_id AND b.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can view notifications" ON notifications;
CREATE POLICY "Business owners can view notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN businesses b ON b.id = a.business_id
      WHERE a.id = notifications.appointment_id AND b.owner_id = auth.uid()
    )
  );

-- 8. Drop old policies that reference professional_id directly
DROP POLICY IF EXISTS "Professionals can manage own services" ON services;
DROP POLICY IF EXISTS "Professionals can manage own schedules" ON schedules;
DROP POLICY IF EXISTS "Professionals can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can update own appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can view payments for their appointments" ON payments;
DROP POLICY IF EXISTS "Professionals can view notifications for their appointments" ON notifications;

-- 9. Auto-update trigger for businesses
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Auto-generate slug from business name
CREATE OR REPLACE FUNCTION generate_business_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_business_slug_trigger ON businesses;
CREATE TRIGGER generate_business_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON businesses
  FOR EACH ROW EXECUTE FUNCTION generate_business_slug();

-- 11. Helper function: get business by slug
CREATE OR REPLACE FUNCTION get_business_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  category TEXT,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  currency TEXT,
  timezone TEXT,
  whatsapp_number TEXT,
  owner_id UUID,
  owner_name TEXT,
  owner_phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id, b.name, b.slug, b.category, b.tagline, b.description,
    b.logo_url, b.primary_color, b.secondary_color, b.currency,
    b.timezone, b.whatsapp_number, b.owner_id,
    p.full_name AS owner_name, p.phone AS owner_phone
  FROM businesses b
  JOIN profiles p ON p.id = b.owner_id
  WHERE b.slug = p_slug AND b.is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- 12. Update get_available_slots function
CREATE OR REPLACE FUNCTION get_available_slots(
  p_professional_id UUID,
  p_date DATE,
  p_duration_min INT DEFAULT 30
)
RETURNS TABLE (
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_day_of_week INT;
  v_schedule RECORD;
  v_slot_start TIME;
  v_slot_end TIME;
  v_duration INTERVAL;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);
  v_duration := INTERVAL '1 minute' * p_duration_min;

  FOR v_schedule IN
    SELECT start_time, end_time
    FROM schedules s
    WHERE s.professional_id = p_professional_id
      AND s.day_of_week = v_day_of_week
      AND s.is_active = true
    LIMIT 1
  LOOP
    v_slot_start := v_schedule.start_time;

    WHILE v_slot_start + v_duration <= v_schedule.end_time LOOP
      v_slot_end := v_slot_start + v_duration;

      SELECT NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.professional_id = p_professional_id
          AND a.status NOT IN ('cancelled')
          AND a.start_at < (p_date + v_slot_end)::timestamptz
          AND a.end_at > (p_date + v_slot_start)::timestamptz
      ) INTO is_available;

      start_time := v_slot_start;
      end_time := v_slot_end;
      RETURN NEXT;

      v_slot_start := v_slot_end;
    END LOOP;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql STABLE;
