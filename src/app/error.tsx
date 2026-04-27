'use client'
import { useEffect, useState } from 'react'

const T = {
  en: {
    lang_toggle: 'العربية',
    title: 'Something went wrong',
    sub: "An unexpected error occurred. Try refreshing the page — if it keeps happening, head back home.",
    btn_retry: 'Try again',
    btn_home: 'Back to home',
  },
  ar: {
    lang_toggle: 'English',
    title: 'حدث خطأ ما',
    sub: 'حدث خطأ غير متوقع. جرّب تحديث الصفحة — إذا استمر الخطأ، عُد إلى الصفحة الرئيسية.',
    btn_retry: 'المحاولة مجدداً',
    btn_home: 'العودة للرئيسية',
  },
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{min-height:100dvh;font-family:'Space Grotesk','Tajawal',sans-serif;-webkit-font-smoothing:antialiased;background:#FBFAF7;color:#2F2A24;}
.err-wrap{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;position:relative;}
.err-lang{position:absolute;top:20px;right:20px;background:#F5F2EC;border:1px solid #E8E2D6;padding:0 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:#2F2A24;font-family:inherit;min-height:40px;display:inline-flex;align-items:center;}
[dir=rtl] .err-lang{right:auto;left:20px;}
.err-lang:hover{background:#EFEAE0;}
.icon-wrap{width:72px;height:72px;background:#FDEAEA;border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;}
.title{font-family:'Cal Sans','Space Grotesk','Tajawal',sans-serif;font-size:clamp(20px,3vw,28px);font-weight:700;letter-spacing:-.03em;margin-bottom:10px;}
.sub{font-size:14px;color:#6B6257;max-width:360px;line-height:1.6;margin-bottom:28px;}
.actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.btn{padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none;transition:all .18s;touch-action:manipulation;border:none;min-height:48px;display:inline-flex;align-items:center;}
.btn-retry{background:#E8765C;color:white;}
.btn-retry:hover{background:#D45A3F;transform:translateY(-1px);}
.btn-home{background:white;color:#2F2A24;border:1.5px solid #E8E2D6;}
.btn-home:hover{border-color:#E8765C;color:#D45A3F;}
button,a{touch-action:manipulation;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition-duration:.01ms!important;}}
`

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const t = T[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => { console.error(error) }, [error])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} suppressHydrationWarning/>
      <div className="err-wrap" dir={dir}>
        <button className="err-lang" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} aria-label="Switch language">
          {t.lang_toggle}
        </button>

        <div className="icon-wrap">
          <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="#E05252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 19h20L12 2z"/><path d="M12 9v5"/><circle cx="12" cy="17" r=".5" fill="#E05252"/>
          </svg>
        </div>
        <h1 className="title">{t.title}</h1>
        <p className="sub">{t.sub}</p>
        <div className="actions">
          <button className="btn btn-retry" onClick={reset}>{t.btn_retry}</button>
          <a className="btn btn-home" href="/">{t.btn_home}</a>
        </div>
      </div>
    </>
  )
}
