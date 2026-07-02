import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { PLATFORMS } from '@/lib/platforms'
import { getFontPairing } from '@/lib/bio-fonts'
import TrackedLink from './TrackedLink'
import EmailCaptureForm from './EmailCaptureForm'
import type { Metadata } from 'next'

function detectLang(acceptLang: string | null): 'ar' | 'en' {
  if (!acceptLang) return 'en'
  return acceptLang.includes('ar') ? 'ar' : 'en'
}

function faviconFor(url: string): string | null {
  try {
    const host = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`
  } catch {
    return null
  }
}

interface BioLink {
  id: string; title: string; url: string; sort_order: number; platform?: string | null
  is_active: boolean; is_featured?: boolean | null
}
interface BioPage {
  id: string; username: string; display_name: string | null; bio: string | null
  accent_color: string; background_color: string; avatar_url: string | null
  button_style?: string | null; button_color?: string | null; button_text_color?: string | null
  bg_image_url?: string | null; font_pairing?: string | null; collect_emails?: boolean | null
  bio_links: BioLink[]
}

async function getPage(username: string): Promise<BioPage | null> {
  const sb = await createClient()
  const { data } = await sb
    .from('bio_pages')
    .select('id, username, display_name, bio, accent_color, background_color, avatar_url, button_style, button_color, button_text_color, bg_image_url, font_pairing, collect_emails, bio_links(id, title, url, sort_order, is_active, platform, is_featured)')
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
  const desc = page.bio || `${name}'s links on J2z`
  const url  = `https://j2z.com/${page.username}`
  return {
    title: `${name} — J2z`,
    description: desc,
    openGraph: {
      title: `${name} — J2z`,
      description: desc,
      url,
      siteName: 'J2z',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${name} — J2z`,
      description: desc,
    },
    alternates: { canonical: url },
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
  const [page, headersList] = await Promise.all([getPage(username), headers()])
  if (!page) notFound()
  const lang = detectLang(headersList.get('accept-language'))

  const allLinks = (page.bio_links ?? []).filter(l => l.is_active).sort((a, b) => a.sort_order - b.sort_order)
  const socialLinks = allLinks.filter(l => l.platform && PLATFORMS[l.platform])
  const customLinks = allLinks.filter(l => !l.platform)
  const featuredLink = customLinks.find(l => l.is_featured) ?? null
  const regularLinks = customLinks.filter(l => l.id !== featuredLink?.id)

  const accent = page.accent_color || '#E8765C'
  const pageBg = page.background_color || '#1A1612'
  const btnColor = page.button_color || ''
  const btnTextColor = page.button_text_color || ''
  const btnStyle = page.button_style || 'glass'
  const bgImage = page.bg_image_url || null
  const fonts = getFontPairing(page.font_pairing)

  const isAvatarImage = page.avatar_url && page.avatar_url.startsWith('http')
  const isAvatarEmoji = page.avatar_url && !page.avatar_url.startsWith('http')
  const avatarLetter = (page.display_name || page.username)[0]?.toUpperCase() || '?'

  const buttonInlineStyle = getBtnStyle(btnStyle, accent, btnColor, btnTextColor)
  const featuredStyle = getBtnStyle(btnStyle, accent, btnColor, btnTextColor)

  const css = `
@import url('https://fonts.googleapis.com/css2?${fonts.googleFontsQuery}&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  min-height: 100dvh;
  font-family: ${fonts.body};
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
  font-family: ${fonts.display};
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
  text-align: center; font-family: ${fonts.display};
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

/* Featured link */
.featured-link {
  display: flex; align-items: center; gap: 14px;
  width: 100%; padding: 18px 20px; margin-bottom: 14px;
  text-decoration: none; font-family: inherit;
  transition: opacity .18s ease, transform .18s ease;
  cursor: pointer; touch-action: manipulation;
  position: relative; overflow: hidden;
}
.featured-link:hover { opacity: 0.9; transform: translateY(-2px); }
.featured-link:active { transform: translateY(0); opacity: .8; }
.featured-thumb {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.featured-thumb img { width: 24px; height: 24px; }
.featured-text { flex: 1; min-width: 0; text-align: left; }
[dir=rtl] .featured-text { text-align: right; }
.featured-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; opacity: 0.6; margin-bottom: 2px; }
.featured-title { font-size: 15.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Custom link buttons */
.links { display: flex; flex-direction: column; gap: 10px; width: 100%; }

.link-btn {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 15px 20px;
  font-size: 14.5px; font-weight: 600;
  text-decoration: none;
  transition: opacity .18s ease, transform .18s ease;
  cursor: pointer; touch-action: manipulation; font-family: inherit;
  opacity: 0; animation: linkIn .35s ease forwards;
  /* button style applied inline */
}
.link-favicon { width: 18px; height: 18px; flex-shrink: 0; border-radius: 4px; }
.link-btn-title { flex: 1; text-align: left; }
[dir=rtl] .link-btn-title { text-align: right; }
${(btnStyle === 'glass') ? `.link-btn, .featured-link { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }` : ''}
.link-btn:hover { opacity: 0.85; transform: translateY(-2px); }
.link-btn:active { transform: translateY(0); opacity: .75; }
.link-arrow {
  width: 18px; height: 18px; flex-shrink: 0;
  opacity: 0.4; transition: opacity .18s, transform .18s;
}
.link-btn:hover .link-arrow, .featured-link:hover .link-arrow { opacity: 0.8; transform: translateX(2px); }
@keyframes linkIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Email capture */
.email-capture { display: flex; gap: 8px; width: 100%; margin-top: 20px; }
.email-capture-input {
  flex: 1; min-width: 0; padding: 13px 14px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06);
  color: white; font-size: 14px; font-family: inherit; outline: none;
}
.email-capture-input::placeholder { color: rgba(255,255,255,0.4); }
.email-capture-input:focus { border-color: ${accent}; }
.email-capture-btn {
  padding: 13px 18px; border-radius: 12px; border: none; background: ${accent};
  color: white; font-weight: 700; font-size: 13.5px; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: opacity .15s;
}
.email-capture-btn:hover { opacity: 0.9; }
.email-capture-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.email-capture-error { width: 100%; font-size: 12px; color: #FF9B85; margin-top: 6px; }
.email-capture-sent { margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.6); }

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
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
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
                  <TrackedLink
                    key={l.id}
                    id={l.id}
                    className="social-icon"
                    href={l.url}
                    ariaLabel={`${plat.name}: ${l.title || plat.name}`}
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
                  </TrackedLink>
                )
              })}
            </div>
          )}

          {featuredLink && (
            <TrackedLink id={featuredLink.id} href={featuredLink.url} className="featured-link" style={featuredStyle}>
              {faviconFor(featuredLink.url) && (
                <div className="featured-thumb">
                  <img src={faviconFor(featuredLink.url)!} alt="" width={24} height={24}/>
                </div>
              )}
              <div className="featured-text">
                <div className="featured-tag">{lang === 'ar' ? 'مميز' : 'Featured'}</div>
                <div className="featured-title">{featuredLink.title}</div>
              </div>
              <svg className="link-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 10h12M10 4l6 6-6 6"/>
              </svg>
            </TrackedLink>
          )}

          {regularLinks.length > 0 && (
            <nav className="links" aria-label="Profile links">
              {regularLinks.map((l, i) => {
                const favicon = faviconFor(l.url)
                return (
                  <TrackedLink
                    key={l.id}
                    id={l.id}
                    className="link-btn"
                    href={l.url}
                    style={{
                      ...buttonInlineStyle,
                      animationDelay: `${0.25 + i * 0.06}s`,
                    }}
                  >
                    {favicon && <img className="link-favicon" src={favicon} alt="" width={18} height={18}/>}
                    <span className="link-btn-title">{l.title}</span>
                    <svg className="link-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 10h12M10 4l6 6-6 6"/>
                    </svg>
                  </TrackedLink>
                )
              })}
            </nav>
          )}

          {page.collect_emails && <EmailCaptureForm username={page.username} lang={lang}/>}

          <div className="footer-cta">
            <p className="footer-cta-text">j2z.com/{page.username}</p>
            <a className="footer-cta-btn" href="/" target="_blank" rel="noopener noreferrer">
              <span className="footer-logo-dot" aria-hidden="true"/>
              {lang === 'ar' ? 'أنشئ صفحتك المجانية' : 'Create your free bio page'}
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
