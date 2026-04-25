import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, url } = body

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (title !== undefined) updates.title = title.trim()
  if (url !== undefined) {
    if (!/^https?:\/\/.+/.test(url.trim())) {
      return NextResponse.json({ error: 'URL must start with https://' }, { status: 400 })
    }
    updates.url = url.trim()
  }

  const { data: page } = await sb.from('bio_pages').select('id').eq('user_id', user.id).maybeSingle()
  if (!page) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await sb
    .from('bio_links')
    .update(updates)
    .eq('id', id)
    .eq('bio_page_id', page.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: page } = await sb.from('bio_pages').select('id').eq('user_id', user.id).maybeSingle()
  if (!page) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await sb
    .from('bio_links')
    .update({ is_active: false })
    .eq('id', id)
    .eq('bio_page_id', page.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
