import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page not found — J2z' }

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{min-height:100dvh;font-family:'Space Grotesk','Tajawal',sans-serif;-webkit-font-smoothing:antialiased;background:#FBFAF7;color:#2F2A24;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;}
.logo-row{display:flex;align-items:center;gap:8px;margin-bottom:48px;text-decoration:none;}
.logo-name{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;letter-spacing:-.04em;color:#2F2A24;}
.glyph{font-family:'Cal Sans','Space Grotesk',sans-serif;font-size:clamp(80px,18vw,140px);font-weight:700;line-height:1;letter-spacing:-.05em;color:#FBEDE8;position:relative;user-select:none;}
.glyph span{color:#E8765C;}
.title{font-family:'Cal Sans','Tajawal',sans-serif;font-size:clamp(22px,4vw,32px);font-weight:700;letter-spacing:-.03em;margin-bottom:10px;margin-top:-8px;}
.sub{font-size:15px;color:#6B6257;max-width:360px;line-height:1.6;margin-bottom:32px;}
.actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.btn-home{padding:12px 24px;background:#E8765C;color:white;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none;transition:all .18s;touch-action:manipulation;}
.btn-home:hover{background:#D45A3F;transform:translateY(-1px);}
.btn-back{padding:12px 24px;background:white;color:#2F2A24;border:1.5px solid #E8E2D6;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;text-decoration:none;transition:all .18s;touch-action:manipulation;}
.btn-back:hover{border-color:#E8765C;color:#D45A3F;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
`

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style dangerouslySetInnerHTML={{__html: css}}/>
      </head>
      <body>
        <Link className="logo-row" href="/">
          <svg viewBox="0 0 60 60" width={28} height={28} fill="none">
            <rect width="60" height="60" rx="16" fill="#FBEDE8"/>
            <rect x="28" y="16" width="5" height="20" fill="#F4A593"/>
            <rect x="33" y="13" width="5" height="23" fill="#E8765C"/>
            <rect x="38" y="10" width="5" height="26" fill="#D45A3F"/>
            <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593"/>
            <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F"/>
          </svg>
          <span className="logo-name">J2z</span>
        </Link>

        <div className="glyph">4<span>0</span>4</div>
        <h1 className="title">Page not found</h1>
        <p className="sub">This link doesn&apos;t exist or may have been moved. Check the URL or head back home.</p>

        <div className="actions">
          <Link className="btn-home" href="/">Back to home</Link>
          <Link className="btn-back" href="/dashboard">Go to dashboard</Link>
        </div>
      </body>
    </html>
  )
}
