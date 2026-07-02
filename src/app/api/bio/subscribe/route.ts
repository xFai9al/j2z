import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

function makeServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const username = body?.username?.trim()
  const email = body?.email?.trim().toLowerCase()

  if (!username || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const service = makeServiceClient()
  const { data: page } = await service
    .from('bio_pages')
    .select('id, collect_emails, is_published')
    .eq('username', username)
    .maybeSingle()

  if (!page?.is_published || !page.collect_emails) {
    return NextResponse.json({ error: 'Not accepting emails' }, { status: 404 })
  }

  const { error } = await service.from('bio_subscribers').insert({ bio_page_id: page.id, email })
  if (error && error.code !== '23505') { // ignore duplicate email
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
