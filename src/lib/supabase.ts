import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helpers de usuário (localStorage)
export const USER_KEY = 'bolao_user_id'

export function getLocalUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_KEY)
}

export function setLocalUserId(id: string) {
  localStorage.setItem(USER_KEY, id)
}

export function clearLocalUser() {
  localStorage.removeItem(USER_KEY)
}
