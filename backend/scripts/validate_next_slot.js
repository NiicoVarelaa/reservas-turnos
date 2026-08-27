// Validation harness for DatabaseService.getNextAvailableSlot.
// Mocks @supabase/supabase-js so the real method runs against scripted data
// for two scenarios: (1) a business with availability today,
// and (2) a business with no availability in the next 14 days.
process.env.SUPABASE_URL = 'http://fake'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-key'

const Module = require('module')

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const fullDay = (pid, start = '09:00', end = '18:00') =>
  ALL_DAYS.map(d => ({ professional_id: pid, day_of_week: d, start_time: start, end_time: end, is_active: true }))

// Mock Supabase client. from(table).select(...) resolves to scripted data.
function mockClient(scene) {
  return {
    from: (table) => {
      const handlers = {
        services: () => ({ data: scene.services, error: null }),
        schedules: () => ({ data: scene.schedules, error: null }),
        appointments: () => ({ data: scene.appointments, error: null }),
      }
      const mk = () => {
        let single = false
        const q = {
          select: () => q,
          eq: () => q,
          in: () => q,
          not: () => q,
          gte: () => q,
          lte: () => q,
          order: () => q,
          single: () => { single = true; return q },
          then: (ok, err) => {
            let r = handlers[table]()
            const out = single ? { data: (r.data || [])[0] || null, error: null } : r
            Promise.resolve(out).then(ok, err)
          },
        }
        return q
      }
      return mk()
    },
  }
}

const realLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === '@supabase/supabase-js') {
    return { createClient: () => mockClient(SCENE) }
  }
  return realLoad.apply(this, arguments)
}
let SCENE = null

function freshDb() {
  delete require.cache[require.resolve('../src/config/supabase')]
  delete require.cache[require.resolve('../src/services/database')]
  require('../src/config/supabase')
  return require('../src/services/database')
}

async function runScene(name, scene) {
  SCENE = scene
  const db = freshDb()
  const result = await db.getNextAvailableSlot('biz-1')
  const now = new Date()
  const todayOffset = result
    ? Math.abs((new Date(result.start) - now) / 86400000)
    : null
  console.log(`\n=== ${name} ===`)
  console.log('returned slot:', result ? JSON.stringify(result) : 'null (fallback)')
  if (result) console.log(`  -> availability found; start=${new Date(result.start).toISOString()} (${todayOffset.toFixed(1)} days from now)`)
  return result
}

function assert(cond, msg) {
  if (!cond) { console.error(`  ✗ FAIL: ${msg}`); process.exitCode = 1 }
  else console.log(`  ✓ pass: ${msg}`)
}

;(async () => {
  // --- SCENARIO 1: business with availability today ---
  const s1 = await runScene('SR1: business with availability today', {
    services: [{ professional_id: 'P1' }],
    schedules: fullDay('P1'),           // open every weekday 09:00-18:00
    appointments: [],                    // nothing booked -> first slot today is free
  })
  assert(s1 !== null, 'returns a slot (not null)')
  if (s1) {
    assert(new Date(s1.start).getTime() >= Date.now() - 60000, 'slot start is not in the past')
    assert(Math.abs((new Date(s1.start) - new Date()) / 86400000) < 1, 'earliest free slot lands within today')
  }

  // --- SCENARIO 2: business with NO availability in the next 14 days ---
  const s2 = await runScene('SR2: business with no availability in 14 days', {
    services: [{ professional_id: 'P1' }],
    // Active schedules whose window is zero-length (start == end): the while loop
    // never yields a slot, so no day in the 14-day window has availability.
    schedules: fullDay('P1', '09:00', '09:00'),
    appointments: [],
  })
  assert(s2 === null, 'returns null (silent fallback, no layout breakage)')

  console.log('\nDONE. Exit code:', process.exitCode ? 'FAILURES PRESENT' : '0 (all passed)')
})()
