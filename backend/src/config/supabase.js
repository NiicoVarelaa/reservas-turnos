const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

module.exports = { supabaseAdmin }
