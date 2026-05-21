// Single Supabase browser client used by the auth store, repositories, and
// any direct callers (uploads). Session is persisted to localStorage so a
// page reload keeps the user signed in.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env?.VITE_SUPABASE_URL
const anon = import.meta.env?.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — auth & data will fail.')
}

export const supabase = createClient(url || '', anon || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'school.session',
  },
})

// A second client instance used by the admin "Create user" flow. It has its
// own storage namespace so signing a new user up here does not overwrite the
// current admin's session.
export const supabaseSignupClient = createClient(url || '', anon || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'school.signup-client',
  },
})

export default supabase
