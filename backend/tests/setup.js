// Runs before each test file (setupFilesAfterEnv).
//
// app.js mounts every route, so importing it always evaluates config/stripe,
// config/supabase and config/whatsapp. Those modules build real SDK clients and
// throw when their env vars are missing, which is the case in CI (no .env).
//
// Env seeding alone is not enough: createClient() spins up a RealtimeClient that
// requires native WebSocket, unavailable on Node 20. So the third-party configs
// are replaced with the test helpers. Individual test files can still re-mock
// any of these; their jest.mock call wins for that file.
const { TEST_ACCESS_SECRET, TEST_REFRESH_SECRET } = require('./helpers/constants')

jest.mock('../src/config/stripe', () => require('./helpers/stripe'))
jest.mock('../src/config/supabase', () => require('./helpers/supabase'))
jest.mock('../src/config/whatsapp', () => require('./helpers/configWhatsapp'))
jest.mock('../src/services/email', () => require('./helpers/email'))

// utils/jwt.js reads these at import time and throws if absent.
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET
process.env.JWT_REFRESH_SECRET = TEST_REFRESH_SECRET
process.env.JWT_ACCESS_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'

process.env.FRONTEND_URL = 'http://localhost:5173'
