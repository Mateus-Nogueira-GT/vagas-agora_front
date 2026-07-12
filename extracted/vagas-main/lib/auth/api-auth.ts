import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export type AuthResult =
  | { authorized: true; user: User; supabase: SupabaseClient; error: null }
  | { authorized: false; user: null; supabase: SupabaseClient; error: string }

export async function verifyAuth(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      authorized: false,
      user: null,
      supabase,
      error: 'Não autenticado'
    }
  }

  return {
    authorized: true,
    user,
    supabase,
    error: null
  }
}
