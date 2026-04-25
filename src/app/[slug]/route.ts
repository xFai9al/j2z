import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { slug } = params

  const { data: link } = await supabase
    .from('links')
    .select('id, destination_url, clicks')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (link) {
    supabase.from('links').update({ clicks: (link.clicks ?? 0) + 1 }).eq('id', link.id).then(() => {})
    return NextResponse.redirect(link.destination_url, { status: 301 })
  }

  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id, destination_url, scans')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (qr) {
    supabase.from('qr_codes').update({ scans: (qr.scans ?? 0) + 1 }).eq('id', qr.id).then(() => {})
    return NextResponse.redirect(qr.destination_url, { status: 301 })
  }

  return NextResponse.redirect(new URL('/?notfound=1', req.url))
}
