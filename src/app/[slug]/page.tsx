import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SlugRedirect({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { slug } = params

  const { data: link } = await supabase
    .from('links')
    .select('id, destination_url, clicks')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (link) {
    await supabase.from('links').update({ clicks: (link.clicks ?? 0) + 1 }).eq('id', link.id)
    redirect(link.destination_url)
  }

  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id, destination_url, scans')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (qr) {
    await supabase.from('qr_codes').update({ scans: (qr.scans ?? 0) + 1 }).eq('id', qr.id)
    redirect(qr.destination_url)
  }

  redirect('/?notfound=1')
}
