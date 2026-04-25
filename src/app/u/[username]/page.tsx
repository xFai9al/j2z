import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface BioLink { id: string; title: string; url: string; sort_order: number }
interface BioPage {
  id: string; username: string; display_name: string | null; bio: string | null
  accent_color: string; background_color: string
  bio_links: (BioLink & { is_active: boolean })[]
}

async function getPage(username: string): Promise<BioPage | null> {
  const sb = await createClient()
  const { data } = await sb
    .from('bio_pages')
    .select('id, username, display_name, bio, accent_color, background_color, bio_links(id, title, url, sort_order, is_active)')
    .eq('username', username)
    .eq('is_published', true)
    .maybeSingle()
  return data as BioPage | null
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const page = await getPage(username)
  if (!page) return { title: 'Not found' }
  const name = page.display_name || page.username
  return {
    title: `${name} — J2z`,
    description: page.bio || `${name}'s links on J2z`,
    openGraph: {
      title: `${name} — J2z`,
      description: page.bio || `${name}'s links on J2z`,
      url: `https://j2z.com/u/${page.username}`,
      siteName: 'J2z',
    },
  }
}

export default async function BioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const page = await getPage(username)
  if (!page) notFound()

  const links = (page.bio_links ?? [])
    .filter(l => l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  const accent = page.accent_color || '#E8765C'
  const avatarLetter = (page.display_name || page.username)[0]?.toUpperCase() || '?'

  // Track view fire-and-forget
  const sb = await createClient()
  sb.from('clicks').insert({ resource_type: 'bio', resource_id: page.id, device_type: 'unknown' }).then(() => {})

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  min-height: 100dvh;
  font-family: 'Space Grotesk', 'Tajawal', sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: #1A1612;
  background-image:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,118,92,0.18) 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(143,166,142,0.1) 0%, transparent 50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 80px;
  color: white;
}

/* ── Branding strip ── */
.brand-strip {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 40px;
  text-decoration: none;
  opacity: 0.5;
  transition: opacity .2s;
}
.brand-strip:hover { opacity: 0.85; }
.brand-name {
  font-size: 14px; font-weight: 700; color: white;
  letter-spacing: -0.03em;
}

/* ── Card ── */
.page { width: 100%; max-width: 420px; }

/* ── Avatar ── */
.avi-wrap { text-align: center; margin-bottom: 16px; }
.avi {
  width: 88px; height: 88px; border-radius: 50%;
  background: linear-gradient(135deg, ${accent} 0%, #E8C66B 100%);
  margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  font-size: 34px; font-weight: 700; color: white;
  font-family: 'Cal Sans', sans-serif;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.06), 0 0 40px rgba(232,118,92,0.25);
  animation: avatarIn .5s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes avatarIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* ── Name / bio ── */
.name {
  text-align: center;
  font-family: 'Cal Sans', 'Tajawal', sans-serif;
  font-size: 24px; font-weight: 700; color: white;
  margin-bottom: 7px; letter-spacing: -0.03em;
  animation: fadeUp .4s ease .1s both;
}
.bio-text {
  text-align: center;
  font-size: 14px; color: rgba(255,255,255,0.5);
  margin-bottom: 32px; line-height: 1.55;
  animation: fadeUp .4s ease .15s both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Links ── */
.links { display: flex; flex-direction: column; gap: 10px; width: 100%; }

.link-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 15px 20px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  color: white; font-size: 14.5px; font-weight: 600;
  text-decoration: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
  cursor: pointer;
  touch-action: manipulation;
  font-family: inherit;
  opacity: 0;
  animation: linkIn .35s ease forwards;
}
.link-btn:hover {
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.25);
  transform: translateY(-2px);
}
.link-btn:active { transform: translateY(0); opacity: .85; }
.link-arrow {
  width: 18px; height: 18px; flex-shrink: 0;
  color: rgba(255,255,255,0.35);
  transition: color .18s, transform .18s;
}
.link-btn:hover .link-arrow {
  color: rgba(255,255,255,0.7);
  transform: translateX(2px);
}
@keyframes linkIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Footer ── */
.footer-cta {
  margin-top: 44px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.footer-cta-text {
  font-size: 12px; color: rgba(255,255,255,0.3); line-height: 1.5;
}
.footer-cta-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 100px;
  color: rgba(255,255,255,0.7);
  font-size: 12px; font-weight: 600;
  text-decoration: none;
  transition: all .18s;
  font-family: inherit;
  touch-action: manipulation;
}
.footer-cta-btn:hover {
  background: rgba(255,255,255,0.12);
  color: white;
}
.footer-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: ${accent}; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style dangerouslySetInnerHTML={{__html: css}}/>
      </head>
      <body>
        <a className="brand-strip" href="/" aria-label="J2z home">
          <svg viewBox="0 0 60 60" width={22} height={22} fill="none">
            <rect width="60" height="60" rx="16" fill="rgba(255,255,255,0.12)"/>
            <rect x="28" y="16" width="5" height="20" fill="rgba(255,255,255,0.4)"/>
            <rect x="33" y="13" width="5" height="23" fill="rgba(255,255,255,0.7)"/>
            <rect x="38" y="10" width="5" height="26" fill="white"/>
            <path d="M43 10 L50 10 L43 18 Z" fill="rgba(255,255,255,0.4)"/>
            <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="white"/>
          </svg>
          <span className="brand-name">J2z</span>
        </a>

        <div className="page">
          <div className="avi-wrap">
            <div className="avi" role="img" aria-label={`${page.display_name || page.username} avatar`}>
              {avatarLetter}
            </div>
          </div>
          <div className="name">{page.display_name || page.username}</div>
          {page.bio && <div className="bio-text">{page.bio}</div>}

          <nav className="links" aria-label="Profile links">
            {links.map((l, i) => (
              <a
                key={l.id}
                className="link-btn"
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ animationDelay: `${0.2 + i * 0.06}s` }}
              >
                <span>{l.title}</span>
                <svg className="link-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 10h12M10 4l6 6-6 6"/>
                </svg>
              </a>
            ))}
          </nav>

          <div className="footer-cta">
            <p className="footer-cta-text">j2z.com/u/{page.username}</p>
            <a className="footer-cta-btn" href="/" target="_blank">
              <span className="footer-logo-dot" aria-hidden="true"/>
              Create your free bio page
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
