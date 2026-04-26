import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Deactivate all user data
  await Promise.all([
    sb.from('links').update({ is_active: false }).eq('user_id', user.id),
    sb.from('qr_codes').update({ is_active: false }).eq('user_id', user.id),
    sb.from('bio_pages').update({ is_published: false }).eq('user_id', user.id),
  ])

  await sb.auth.signOut()

  return NextResponse.json({ success: true })
}
