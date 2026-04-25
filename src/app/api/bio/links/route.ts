import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, url } = await req.json()
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'Title and URL required' }, { status: 400 })
  }
  if (!/^https?:\/\/.+/.test(url.trim())) {
    return NextResponse.json({ error: 'URL must start with https://' }, { status: 400 })
  }

  const { data: page } = await sb
    .from('bio_pages')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!page) return NextResponse.json({ error: 'No bio page found' }, { status: 404 })

  const { count } = await sb
    .from('bio_links')
    .select('*', { count: 'exact', head: true })
    .eq('bio_page_id', page.id)
    .eq('is_active', true)

  const { data, error } = await sb
    .from('bio_links')
    .insert({ bio_page_id: page.id, title: title.trim(), url: url.trim(), sort_order: count ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data }, { status: 201 })
}
