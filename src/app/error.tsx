'use client'
import { useEffect } from 'react'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{min-height:100dvh;font-family:'Space Grotesk',sans-serif;-webkit-font-smoothing:antialiased;background:#FBFAF7;color:#2F2A24;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;}
.icon-wrap{width:72px;height:72px;background:#FDEAEA;border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;}
.title{font-family:'Cal Sans','Space Grotesk',sans-serif;font-size:clamp(20px,3vw,28px);font-weight:700;letter-spacing:-.03em;margin-bottom:10px;}
.sub{font-size:14px;color:#6B6257;max-width:340px;line-height:1.6;margin-bottom:28px;}
.actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.btn{padding:11px 22px;border-radius:11px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none;transition:all .18s;touch-action:manipulation;border:none;}
.btn-retry{background:#E8765C;color:white;}
.btn-retry:hover{background:#D45A3F;transform:translateY(-1px);}
.btn-home{background:white;color:#2F2A24;border:1.5px solid #E8E2D6;}
.btn-home:hover{border-color:#E8765C;color:#D45A3F;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition-duration:.01ms!important;}}
`

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} suppressHydrationWarning/>
      <div className="icon-wrap">
        <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="#E05252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 19h20L12 2z"/><path d="M12 9v5"/><circle cx="12" cy="17" r=".5" fill="#E05252"/>
        </svg>
      </div>
      <h1 className="title">Something went wrong</h1>
      <p className="sub">An unexpected error occurred. Try refreshing the page — if it keeps happening, head back home.</p>
      <div className="actions">
        <button className="btn btn-retry" onClick={reset}>Try again</button>
        <a className="btn btn-home" href="/">Back to home</a>
      </div>
    </>
  )
}
