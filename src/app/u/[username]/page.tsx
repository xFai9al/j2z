import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface BioLink { id: string; title: string; url: string; sort_order: number }
interface BioPage {
  id: string; username: string; display_name: string | null; bio: string | null
  accent_color: string; background_color: string
  bio_links: BioLink[]
}

export default async function BioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const sb = await createClient()

  const { data: page } = await sb
    .from('bio_pages')
    .select('id, username, display_name, bio, accent_color, background_color, bio_links(id, title, url, sort_order, is_active)')
    .eq('username', username)
    .eq('is_published', true)
    .maybeSingle() as { data: BioPage | null }

  if (!page) notFound()

  const links = ((page.bio_links ?? []) as (BioLink & { is_active: boolean })[])
    .filter(l => l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  const accent = page.accent_color || '#E8765C'
  const avatarLetter = (page.display_name || page.username)[0]?.toUpperCase() || '?'

  // Track bio page view (fire-and-forget)
  sb.from('clicks').insert({
    resource_type: 'bio',
    resource_id: page.id,
    device_type: 'unknown',
  }).then(() => {})

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: linear-gradient(145deg, #2F2A24 0%, #1E1A14 100%);
  min-height: 100vh;
  font-family: 'Space Grotesk', 'Tajawal', sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 40px 16px 80px;
}
.page { width: 100%; max-width: 480px; }
.avi {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, ${accent} 0%, #E8C66B 100%);
  margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 700; color: white;
  font-family: 'Cal Sans', sans-serif;
}
.name {
  text-align: center;
  font-family: 'Cal Sans', 'Tajawal', sans-serif;
  font-size: 22px; font-weight: 700; color: white;
  margin-bottom: 6px; letter-spacing: -0.02em;
}
.bio {
  text-align: center;
  font-size: 13.5px; color: rgba(255,255,255,0.55);
  margin-bottom: 28px; line-height: 1.5;
}
.links { display: flex; flex-direction: column; gap: 10px; }
.link-btn {
  display: block; width: 100%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px; padding: 14px 18px;
  color: white; font-size: 14px; font-weight: 600;
  text-align: center; text-decoration: none;
  backdrop-filter: blur(8px);
  transition: all 0.2s; cursor: pointer;
  font-family: inherit;
}
.link-btn:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.35);
  transform: translateY(-1px);
}
.footer {
  margin-top: 36px; text-align: center;
  font-size: 11px; color: rgba(255,255,255,0.25);
}
.footer a { color: ${accent}; text-decoration: none; font-weight: 600; }
.footer a:hover { color: white; }
`

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="avi">{avatarLetter}</div>
        <div className="name">{page.display_name || page.username}</div>
        {page.bio && <div className="bio">{page.bio}</div>}
        <div className="links">
          {links.map(l => (
            <a key={l.id} className="link-btn" href={l.url} target="_blank" rel="noopener noreferrer">
              {l.title}
            </a>
          ))}
        </div>
        <div className="footer">
          Powered by <a href="/" target="_blank">J2z</a>
        </div>
      </div>
    </>
  )
}
