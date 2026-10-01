// Runs before each test file (setupFilesAfterEnv).
// app.js mounts every route, so importing it always evaluates config/stripe and
// config/supabase. Those modules throw when their env vars are missing, which is
// the case in CI (no .env). Seed dummy values so module loading succeeds;
// individual test files still mock the modules they care about.
const { TEST_ACCESS_SECRET, TEST_REFRESH_SECRET } = require('./helpers/constants')

process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET
process.env.JWT_REFRESH_SECRET = TEST_REFRESH_SECRET
process.env.JWT_ACCESS_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'

process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy'
process.env.STRIPE_CURRENCY = 'ars'

process.env.SUPABASE_URL = 'https://dummy.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy-service-role-key'

process.env.FRONTEND_URL = 'http://localhost:5173'
