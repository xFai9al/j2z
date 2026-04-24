import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data } = await supabase
    .from('links')
    .select('id, destination_url, clicks')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!data) {
    return NextResponse.redirect(new URL('/?notfound=1', req.url))
  }

  supabase
    .from('links')
    .update({ clicks: (data.clicks ?? 0) + 1 })
    .eq('id', data.id)
    .then(() => {})

  return NextResponse.redirect(data.destination_url, { status: 301 })
}
