import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id, false)
  if (error) return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })

  await sb.auth.signOut({ scope: 'global' })

  return NextResponse.json({ success: true })
}
