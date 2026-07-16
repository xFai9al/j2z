import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin'
import { NextRequest, NextResponse } from 'next/server'

async function checkAdmin() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  return (await isAdmin(createAdminClient(), user.id)) ? user : null
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const svc = createAdminClient()
  const { data } = await svc.from('url_blocklist').select('id,pattern,pattern_type,reason,created_at').order('created_at', { ascending: false })
  return NextResponse.json({ blocklist: data ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { pattern, pattern_type = 'domain', reason = null } = await req.json()
  if (!pattern?.trim()) return NextResponse.json({ error: 'pattern required' }, { status: 400 })

  const svc = createAdminClient()
  const { data, error } = await svc
    .from('url_blocklist')
    .insert({ pattern: pattern.trim().toLowerCase(), pattern_type, reason })
    .select('id,pattern,pattern_type,reason,created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(req: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const svc = createAdminClient()
  const { error } = await svc.from('url_blocklist').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
