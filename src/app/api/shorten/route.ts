import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlug, isValidUrl, ensureHttps } from '@/lib/utils'
import { checkAnonLinkLimit } from '@/lib/anon-limit'
import { isUrlBlocked } from '@/lib/blocklist'
import { RESERVED } from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const originalUrl = ensureHttps(body.url.trim())
  if (!isValidUrl(originalUrl)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const rawSlug = (body.slug ?? body.customSlug ?? '').trim().replace(/[^a-zA-Z0-9-_]/g, '')
  const service = createAdminClient()

  if (await isUrlBlocked(originalUrl, service)) {
    return NextResponse.json({ error: 'This URL is not allowed' }, { status: 403 })
  }

  if (rawSlug) {
    if (RESERVED.has(rawSlug.toLowerCase())) {
      return NextResponse.json({ error: 'This alias is reserved' }, { status: 400 })
    }
    const [{ data: existingLink }, { data: existingQr }, { data: existingBio }] = await Promise.all([
      service.from('links').select('id').eq('slug', rawSlug).maybeSingle(),
      service.from('qr_codes').select('id').eq('slug', rawSlug).maybeSingle(),
      service.from('bio_pages').select('id').eq('username', rawSlug).maybeSingle(),
    ])

    if (existingLink || existingQr || existingBio) {
      return NextResponse.json({ error: 'This alias is already taken' }, { status: 409 })
    }
  }

  const slug = rawSlug || generateSlug()

  // Identify current user (optional — anon users get user_id = null)
  const anonClient = await createClient()
  const { data: sessionData } = await anonClient.auth.getUser()
  const userId = sessionData?.user?.id ?? null

  if (!userId) {
    const allowed = await checkAnonLinkLimit(req, service).catch(() => false)
    if (!allowed) {
      return NextResponse.json({ error: 'Daily limit reached — sign up for unlimited links' }, { status: 429 })
    }
  }

  // Use service role to bypass RLS — allows both anon and authenticated inserts
  const { data, error } = await service
    .from('links')
    .insert({ slug, destination_url: originalUrl, user_id: userId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug collision, please try again' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    destination_url: data.destination_url,
    short_url: `${siteUrl}/${data.slug}`,
    clicks: data.clicks,
    created_at: data.created_at,
  })
}
