import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PLATFORMS } from '@/lib/platforms'
import type { Metadata } from 'next'

interface BioLink {
  id: string; title: string; url: string; sort_order: number; platform?: string | null; is_active: boolean
}
interface BioPage {
  id: string; username: string; display_name: string | null; bio: string | null
  accent_color: string; background_color: string; avatar_url: string | null
  button_style?: string | null; button_color?: string | null; button_text_color?: string | null
  bg_image_url?: string | null
  bio_links: BioLink[]
}

async function getPage(username: string): Promise<BioPage | null> {
  const sb = await createClient()
  const { data } = await sb
    .from('bio_pages')
    .select('id, username, display_name, bio, accent_color, background_color, avatar_url, button_style, button_color, button_text_color, bg_image_url, bio_links(id, title, url, sort_order, is_active, platform)')
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
      url: `https://j2z.com/${page.username}`,
      siteName: 'J2z',
    },
  }
}

function getBtnStyle(style: string | null | undefined, accent: string, btnColor: string, btnTextColor: string) {
  const bg = btnColor || accent
  const fg = btnTextColor || '#ffffff'
  switch (style) {
    case 'fill':
      return { background: bg, border: 'none', borderRadius: '14px', color: fg }
    case 'outline':
      return { background: 'transparent', border: `2px solid ${bg}`, borderRadius: '14px', color: bg }
    case 'pill':
      return { background: bg, border: 'none', borderRadius: '100px', color: fg }
    case 'pill-outline':
      return { background: 'transparent', border: `2px solid ${bg}`, borderRadius: '100px', color: bg }
    case 'soft':
      return { background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '14px', color: '#ffffff' }
    case 'glass':
    default:
      return { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#ffffff' }
  }
}

export default async function BioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const page = await getPage(username)
  if (!page) notFound()

  const allLinks = (page.bio_links ?? []).filter(l => l.is_active).sort((a, b) => a.sort_order - b.sort_order)
  const socialLinks = allLinks.filter(l => l.platform && PLATFORMS[l.platform])
  const customLinks = allLinks.filter(l => !l.platform)

  const accent = page.accent_color || '#E8765C'
  const pageBg = page.background_color || '#1A1612'
  const btnColor = page.button_color || ''
  const btnTextColor = page.button_text_color || ''
  const btnStyle = page.button_style || 'glass'
  const bgImage = page.bg_image_url || null

  const isAvatarImage = page.avatar_url && page.avatar_url.startsWith('http')
  const isAvatarEmoji = page.avatar_url && !page.avatar_url.startsWith('http')
  const avatarLetter = (page.display_name || page.username)[0]?.toUpperCase() || '?'

  const buttonInlineStyle = getBtnStyle(btnStyle, accent, btnColor, btnTextColor)

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  min-height: 100dvh;
  font-family: 'Space Grotesk', 'Tajawal', sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: ${pageBg};
  ${bgImage ? `
  background-image: url('${bgImage}');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  ` : `
  background-image:
    radial-gradient(ellipse 80% 60% at 50% -10%, ${accent}30 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at 80% 100%, ${accent}15 0%, transparent 50%);
  `}
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 80px;
  color: white;
}

${bgImage ? `.bg-overlay {
  position: fixed; inset: 0; z-index: 0;
  background: ${pageBg}cc;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}` : ''}

.page {
  width: 100%; max-width: 440px; position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
}

/* Brand strip */
.brand-strip {
  display: flex; align-items: center; gap: 6px;
  margin-bottom: 36px; text-decoration: none;
  opacity: 0.4; transition: opacity .2s;
}
.brand-strip:hover { opacity: 0.8; }
.brand-name { font-size: 13px; font-weight: 700; color: white; letter-spacing: -0.03em; }

/* Avatar */
.avi-wrap { margin-bottom: 16px; }
.avi {
  width: 90px; height: 90px; border-radius: 50%;
  background: linear-gradient(135deg, ${accent} 0%, #E8C66B 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; font-weight: 700; color: white;
  font-family: 'Cal Sans', sans-serif;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.06), 0 0 40px ${accent}40;
  animation: avatarIn .5s cubic-bezier(0.34,1.56,0.64,1) both;
  overflow: hidden;
}
.avi img { width: 100%; height: 100%; object-fit: cover; }
@keyframes avatarIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* Name / bio */
.name {
  text-align: center; font-family: 'Cal Sans', 'Tajawal', sans-serif;
  font-size: 26px; font-weight: 700; color: white;
  margin-bottom: 6px; letter-spacing: -0.03em;
  animation: fadeUp .4s ease .1s both; text-wrap: balance;
}
.bio-text {
  text-align: center; font-size: 14px; color: rgba(255,255,255,0.5);
  margin-bottom: 28px; line-height: 1.55; max-width: 320px;
  animation: fadeUp .4s ease .15s both; text-wrap: pretty;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Social icons row */
.social-row {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;
  margin-bottom: 24px; width: 100%;
  animation: fadeUp .4s ease .18s both;
}
.social-icon {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: transform .18s, opacity .18s;
  touch-action: manipulation; cursor: pointer; text-decoration: none;
  flex-shrink: 0;
}
.social-icon:hover { transform: translateY(-3px) scale(1.08); opacity: 0.9; }
.social-icon:active { transform: scale(0.93); }
.social-icon svg { display: block; }

/* Custom link buttons */
.links { display: flex; flex-direction: column; gap: 10px; width: 100%; }

.link-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 15px 20px;
  font-size: 14.5px; font-weight: 600;
  text-decoration: none;
  transition: opacity .18s ease, transform .18s ease;
  cursor: pointer; touch-action: manipulation; font-family: inherit;
  opacity: 0; animation: linkIn .35s ease forwards;
  /* button style applied inline */
}
${(btnStyle === 'glass') ? `.link-btn { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }` : ''}
.link-btn:hover { opacity: 0.85; transform: translateY(-2px); }
.link-btn:active { transform: translateY(0); opacity: .75; }
.link-arrow {
  width: 18px; height: 18px; flex-shrink: 0;
  opacity: 0.4; transition: opacity .18s, transform .18s;
}
.link-btn:hover .link-arrow { opacity: 0.8; transform: translateX(2px); }
@keyframes linkIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Footer */
.footer-cta {
  margin-top: 48px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.footer-cta-text { font-size: 11px; color: rgba(255,255,255,0.25); }
.footer-cta-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px; color: rgba(255,255,255,0.55);
  font-size: 12px; font-weight: 600; text-decoration: none;
  transition: all .18s; font-family: inherit; touch-action: manipulation;
}
.footer-cta-btn:hover { background: rgba(255,255,255,0.12); color: white; }
.footer-logo-dot { width: 7px; height: 7px; border-radius: 50%; background: ${accent}; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style dangerouslySetInnerHTML={{__html: css}} suppressHydrationWarning/>
      </head>
      <body>
        {bgImage && <div className="bg-overlay" aria-hidden="true"/>}

        <a className="brand-strip" href="/" aria-label="J2z home">
          <svg viewBox="0 0 60 60" width={20} height={20} fill="none">
            <rect width="60" height="60" rx="16" fill="rgba(255,255,255,0.1)"/>
            <rect x="28" y="16" width="5" height="20" fill="rgba(255,255,255,0.35)"/>
            <rect x="33" y="13" width="5" height="23" fill="rgba(255,255,255,0.65)"/>
            <rect x="38" y="10" width="5" height="26" fill="white"/>
            <path d="M43 10 L50 10 L43 18 Z" fill="rgba(255,255,255,0.35)"/>
            <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="white"/>
          </svg>
          <span className="brand-name">J2z</span>
        </a>

        <div className="page">
          <div className="avi-wrap">
            <div
              className="avi"
              role="img"
              aria-label={`${page.display_name || page.username} avatar`}
              style={isAvatarEmoji ? {fontSize: 40} : undefined}
            >
              {isAvatarImage
                ? <img src={page.avatar_url!} alt="" />
                : isAvatarEmoji
                  ? page.avatar_url
                  : avatarLetter
              }
            </div>
          </div>

          <div className="name">{page.display_name || page.username}</div>
          {page.bio && <div className="bio-text">{page.bio}</div>}

          {socialLinks.length > 0 && (
            <div className="social-row" role="list" aria-label="Social media links">
              {socialLinks.map((l, i) => {
                const plat = PLATFORMS[l.platform!]
                if (!plat) return null
                return (
                  <a
                    key={l.id}
                    className="social-icon"
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="listitem"
                    aria-label={`${plat.name}: ${l.title || plat.name}`}
                    style={{
                      background: plat.color,
                      animationDelay: `${0.2 + i * 0.04}s`,
                      opacity: 0,
                      animation: `linkIn .35s ease ${0.2 + i * 0.04}s forwards`,
                    }}
                  >
                    <svg viewBox="0 0 24 24" width={22} height={22} fill={plat.textColor} aria-hidden="true">
                      <path d={plat.path}/>
                    </svg>
                  </a>
                )
              })}
            </div>
          )}

          {customLinks.length > 0 && (
            <nav className="links" aria-label="Profile links">
              {customLinks.map((l, i) => (
                <a
                  key={l.id}
                  className="link-btn"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...buttonInlineStyle,
                    animationDelay: `${0.25 + i * 0.06}s`,
                  }}
                >
                  <span>{l.title}</span>
                  <svg className="link-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 10h12M10 4l6 6-6 6"/>
                  </svg>
                </a>
              ))}
            </nav>
          )}

          <div className="footer-cta">
            <p className="footer-cta-text">j2z.com/{page.username}</p>
            <a className="footer-cta-btn" href="/" target="_blank" rel="noopener noreferrer">
              <span className="footer-logo-dot" aria-hidden="true"/>
              Create your free bio page
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
