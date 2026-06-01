-- ============================================
-- RESERVAS & TURNOS - SUPABASE DATABASE SCHEMA
-- Version: 2.0.0 (SaaS Multi-Tenant)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'professional' CHECK (role IN ('admin', 'professional')),
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. BUSINESSES (multi-tenant core)
-- ============================================
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

-- ============================================
-- 3. SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_min INT NOT NULL,
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SCHEDULES (weekly availability)
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(professional_id, day_of_week)
);

-- ============================================
-- 5. APPOINTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  professional_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled', 'no_show')),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  type TEXT CHECK (type IN ('confirmation', 'reminder', 'cancellation')),
  channel TEXT CHECK (channel IN ('whatsapp', 'email')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_services_business ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_professional ON services(professional_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_schedules_business ON schedules(business_id);
CREATE INDEX IF NOT EXISTS idx_schedules_professional ON schedules(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_email ON appointments(client_email);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_at ON appointments(start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON appointments(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment ON notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Businesses policies
DROP POLICY IF EXISTS "Anyone can view active businesses" ON businesses;
CREATE POLICY "Anyone can view active businesses" ON businesses
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Businesses can be created by authenticated users" ON businesses;
CREATE POLICY "Businesses can be created by authenticated users" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own business" ON businesses;
CREATE POLICY "Owners can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- Services policies
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

-- Schedules policies
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

-- Appointments policies
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

-- Payments policies
DROP POLICY IF EXISTS "Business owners can view payments" ON payments;
CREATE POLICY "Business owners can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN businesses b ON b.id = a.business_id
      WHERE a.id = payments.appointment_id AND b.owner_id = auth.uid()
    )
  );

-- Notifications policies
DROP POLICY IF EXISTS "Business owners can view notifications" ON notifications;
CREATE POLICY "Business owners can view notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN businesses b ON b.id = a.business_id
      WHERE a.id = notifications.appointment_id AND b.owner_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug from business name
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

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get available time slots for a given date
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

-- Function to check for overlapping appointments
CREATE OR REPLACE FUNCTION check_appointment_overlap(
  p_professional_id UUID,
  p_start_at TIMESTAMPTZ,
  p_end_at TIMESTAMPTZ,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_overlap BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.professional_id = p_professional_id
      AND a.status NOT IN ('cancelled')
      AND a.id != COALESCE(p_exclude_appointment_id, '00000000-0000-0000-0000-000000000000')
      AND a.start_at < p_end_at
      AND a.end_at > p_start_at
  ) INTO v_has_overlap;

  RETURN v_has_overlap;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get business by slug
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
