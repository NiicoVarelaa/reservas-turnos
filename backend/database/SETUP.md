# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the database to be provisioned (~2 minutes)
4. Go to **Project Settings** > **API**
5. Copy the following values:
   - `Project URL` → `SUPABASE_URL`
   - `anon public key` → `SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 2. Run Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the entire content of `database/schema.sql`
4. Click **Run** (or press `Ctrl+Enter`)
5. Verify all tables were created in the **Table Editor**

## 3. Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Disable **Confirm email** (optional, for development)
4. Configure email templates if needed

## 4. Set Up Row Level Security (RLS)

The schema already includes RLS policies. Verify they're active:

1. Go to **Authentication** > **Policies**
2. Check that all tables have RLS enabled
3. Verify policies match the ones in `schema.sql`

## 5. Create First Professional User

### Option A: Via Supabase Dashboard
1. Go to **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Enter email and password
4. Copy the user's UUID

### Option B: Via SQL
```sql
-- Note: You'll need to create the user via Auth first, then run:
UPDATE profiles 
SET role = 'professional', is_verified = true 
WHERE id = 'YOUR_USER_UUID';
```

## 6. Run Seed Data (Optional)

1. Open `database/seed.sql`
2. Replace all instances of `YOUR_USER_ID` with the UUID from step 5
3. Run the script in **SQL Editor**

## 7. Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:4000
```

## 8. Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- Test available slots function (replace with your professional_id)
SELECT * FROM get_available_slots(
  'YOUR_USER_ID'::uuid,
  CURRENT_DATE + INTERVAL '1 day'
);
```

## 9. WhatsApp Template Setup

For WhatsApp notifications, you need to create message templates in Meta Business Suite:

### Template: `confirmacion_reserva`
```
¡Hola {{1}}! Tu reserva ha sido confirmada.

📅 Fecha: {{2}}
🕐 Hora: {{3}}
💼 Servicio: {{4}}

Te esperamos. ¡Gracias por elegirnos!
```

### Template: `recordatorio_reserva`
```
¡Hola {{1}}! Recordatorio de tu reserva de mañana.

📅 Fecha: {{2}}
🕐 Hora: {{3}}
💼 Servicio: {{4}}

¿Necesitas cancelar o reprogramar? Contáctanos.
```

## 10. Stripe Webhook Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** > **Webhooks**
3. Click **Add endpoint**
4. Set endpoint URL: `https://your-domain.com/api/webhooks/stripe`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `payment_intent.succeeded`
6. Copy the **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### RLS blocking inserts
- Check if you're using the `service_role` key (bypasses RLS) for backend operations
- Verify policies allow the operation you're trying to perform

### Auth trigger not firing
- Ensure the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`

### Function errors
- Test functions with valid UUIDs
- Check that referenced tables have data
- Verify timezone settings match your application
