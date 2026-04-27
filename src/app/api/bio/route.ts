import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await sb
    .from('bio_pages')
    .select('*, bio_links(id, title, url, sort_order, is_active, icon)')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ page: data })
}

export async function POST(req: NextRequest) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { username, display_name, bio } = body

  if (!username || !/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return NextResponse.json({ error: 'Invalid username (3-30 chars, letters/numbers/_/-)' }, { status: 400 })
  }

  const { data, error } = await sb
    .from('bio_pages')
    .insert({ user_id: user.id, username, display_name, bio })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Username taken' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ page: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { display_name, bio, is_published, accent_color, background_color, avatar_url } = body

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (display_name !== undefined) updates.display_name = display_name
  if (bio !== undefined) updates.bio = bio
  if (is_published !== undefined) updates.is_published = is_published
  if (accent_color !== undefined) updates.accent_color = accent_color
  if (background_color !== undefined) updates.background_color = background_color
  if (avatar_url !== undefined) updates.avatar_url = avatar_url

  const { data, error } = await sb
    .from('bio_pages')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ page: data })
}
