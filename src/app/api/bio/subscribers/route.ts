import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: page } = await sb.from('bio_pages').select('id').eq('user_id', user.id).maybeSingle()
  if (!page) return NextResponse.json({ subscribers: [] })

  const { data } = await sb
    .from('bio_subscribers')
    .select('email, created_at')
    .eq('bio_page_id', page.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ subscribers: data ?? [] })
}
