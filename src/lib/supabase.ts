import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  _supabase = createClient(url, key)
  return _supabase
}

// Proxy para manter compatibilidade com supabase.from(...) em todo o código
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})

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
