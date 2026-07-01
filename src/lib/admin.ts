import type { SupabaseClient } from '@supabase/supabase-js'

export async function isAdmin(service: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await service
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  return !!data
}
