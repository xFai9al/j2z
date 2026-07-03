import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RESERVED } from '@/lib/constants'
import { FONT_PAIRINGS } from '@/lib/bio-fonts'

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/
const BUTTON_STYLES = new Set(['glass', 'fill', 'outline', 'pill', 'pill-outline', 'soft'])
const FONT_IDS = new Set(FONT_PAIRINGS.map(f => f.id))

/** Valid hex color, or null to clear. Returns undefined if invalid. */
function cleanColor(v: unknown): string | null | undefined {
  if (v === null || v === '') return null
  if (typeof v === 'string' && HEX_COLOR.test(v)) return v
  return undefined
}

/** http(s) URL up to 500 chars, or null to clear. Returns undefined if invalid. */
function cleanUrl(v: unknown): string | null | undefined {
  if (v === null || v === '') return null
  if (typeof v !== 'string' || v.length > 500) return undefined
  try {
    const u = new URL(v)
    if (u.protocol === 'http:' || u.protocol === 'https:') return v
  } catch {}
  return undefined
}

export async function GET() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await sb
    .from('bio_pages')
    .select('*, bio_links(id, title, url, sort_order, is_active, platform, is_featured, clicks)')
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

  if (RESERVED.has(username.toLowerCase())) {
    return NextResponse.json({ error: 'This username is reserved' }, { status: 400 })
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
  const {
    display_name, bio, is_published,
    accent_color, background_color, avatar_url,
    button_style, button_color, button_text_color, bg_image_url,
    font_pairing, collect_emails,
  } = body

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (display_name !== undefined) {
    updates.display_name = display_name === null ? null : String(display_name).slice(0, 60)
  }
  if (bio !== undefined) {
    updates.bio = bio === null ? null : String(bio).slice(0, 160)
  }
  if (is_published !== undefined) updates.is_published = !!is_published
  if (accent_color !== undefined) {
    const v = cleanColor(accent_color)
    if (v === undefined) return NextResponse.json({ error: 'Invalid accent color' }, { status: 400 })
    updates.accent_color = v
  }
  if (background_color !== undefined) {
    const v = cleanColor(background_color)
    if (v === undefined) return NextResponse.json({ error: 'Invalid background color' }, { status: 400 })
    updates.background_color = v
  }
  if (avatar_url !== undefined) {
    // Emoji avatar (short non-URL string) or an http(s) image URL
    if (avatar_url === null || avatar_url === '') {
      updates.avatar_url = null
    } else if (typeof avatar_url === 'string' && !avatar_url.startsWith('http') && avatar_url.length <= 16) {
      updates.avatar_url = avatar_url
    } else {
      const v = cleanUrl(avatar_url)
      if (v === undefined) return NextResponse.json({ error: 'Invalid avatar URL' }, { status: 400 })
      updates.avatar_url = v
    }
  }
  if (button_style !== undefined) {
    if (button_style !== null && !BUTTON_STYLES.has(button_style)) {
      return NextResponse.json({ error: 'Invalid button style' }, { status: 400 })
    }
    updates.button_style = button_style
  }
  if (button_color !== undefined) {
    const v = cleanColor(button_color)
    if (v === undefined) return NextResponse.json({ error: 'Invalid button color' }, { status: 400 })
    updates.button_color = v
  }
  if (button_text_color !== undefined) {
    const v = cleanColor(button_text_color)
    if (v === undefined) return NextResponse.json({ error: 'Invalid button text color' }, { status: 400 })
    updates.button_text_color = v
  }
  if (bg_image_url !== undefined) {
    const v = cleanUrl(bg_image_url)
    if (v === undefined) return NextResponse.json({ error: 'Invalid background image URL' }, { status: 400 })
    updates.bg_image_url = v
  }
  if (font_pairing !== undefined) {
    if (font_pairing !== null && !FONT_IDS.has(font_pairing)) {
      return NextResponse.json({ error: 'Invalid font pairing' }, { status: 400 })
    }
    updates.font_pairing = font_pairing
  }
  if (collect_emails !== undefined) updates.collect_emails = !!collect_emails

  const { data, error } = await sb
    .from('bio_pages')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ page: data })
}
