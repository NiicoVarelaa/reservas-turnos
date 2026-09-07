// Mock of src/config/supabase.js
const supabaseAdmin = {
  auth: {
    getUser: jest.fn()
  }
}

module.exports = { supabaseAdmin }