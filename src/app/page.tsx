'use client'
import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'

// ── Static components moved outside to avoid recreation on every render ───────

const Logo = ({ s = 44, w = false }: { s?: number; w?: boolean }) => {
  const fr = w ? 'rgba(255,255,255,0.15)' : '#FBEDE8'
  const d  = w ? '#FFFFFF' : '#D45A3F'
  const m  = w ? 'rgba(255,255,255,0.7)' : '#E8765C'
  const l  = w ? 'rgba(255,255,255,0.4)' : '#F4A593'
  return (
    <svg viewBox="0 0 60 60" width={s} height={s} fill="none">
      <rect x="0" y="0" width="60" height="60" rx="16" fill={fr}/>
      <rect x="28" y="16" width="5" height="20" fill={l}/>
      <rect x="33" y="13" width="5" height="23" fill={m}/>
      <rect x="38" y="10" width="5" height="26" fill={d}/>
      <path d="M43 10 L50 10 L43 18 Z" fill={l}/>
      <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill={d}/>
    </svg>
  )
}

const QRIcon = ({ s = 28, color = '#D45A3F' }: { s?: number; color?: string }) => (
  <svg viewBox="0 0 32 32" width={s} height={s} fill="none">
    <rect x="2" y="2" width="10" height="10" rx="2" stroke={color} strokeWidth="2"/>
    <rect x="5" y="5" width="4" height="4" fill={color}/>
    <rect x="20" y="2" width="10" height="10" rx="2" stroke={color} strokeWidth="2"/>
    <rect x="23" y="5" width="4" height="4" fill={color}/>
    <rect x="2" y="20" width="10" height="10" rx="2" stroke={color} strokeWidth="2"/>
    <rect x="5" y="23" width="4" height="4" fill={color}/>
    <rect x="14" y="4" width="2" height="2" fill={color}/>
    <rect x="17" y="7" width="2" height="2" fill={color}/>
    <rect x="14" y="10" width="2" height="2" fill={color}/>
    <rect x="14" y="14" width="2" height="2" fill={color}/>
    <rect x="20" y="14" width="2" height="2" fill={color}/>
    <rect x="26" y="14" width="2" height="2" fill={color}/>
    <rect x="14" y="17" width="2" height="2" fill={color}/>
    <rect x="20" y="17" width="2" height="2" fill={color}/>
    <rect x="26" y="17" width="2" height="2" fill={color}/>
    <rect x="17" y="20" width="2" height="2" fill={color}/>
    <rect x="23" y="20" width="2" height="2" fill={color}/>
    <rect x="14" y="23" width="2" height="2" fill={color}/>
    <rect x="20" y="23" width="2" height="2" fill={color}/>
    <rect x="26" y="23" width="2" height="2" fill={color}/>
  </svg>
)

const IcoDownload = ({ s = 14, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3v10M6 9l4 4 4-4"/><path d="M3 17h14"/>
  </svg>
)

const BioAvatarIcon = () => (
  <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.5"/>
    <path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7"/>
  </svg>
)

// ── Static translation data outside component ─────────────────────────────────

const T = {
  en: {
    nav_signin: 'Sign in', nav_signup: 'Get started',
    hero_badge: '✦ Print once. Update forever.',
    hero_title_1: 'Smart links,', hero_title_em: 'free forever.',
    hero_sub: "The shortest domain you'll ever love. Unlimited short links with full analytics — completely free.",
    tool_placeholder: 'Paste your long URL here...', tool_btn: 'Shorten',
    tool_shortened: 'Your short link', tool_copy: 'Copy', tool_copied: '✓ Copied!',
    trust_1: 'No credit card', trust_2: 'No hidden limits', trust_3: 'No ads',
    consent_use_1: 'By using this, you agree to our', consent_terms: 'Terms',
    consent_and: 'and', consent_privacy: 'Privacy Policy', consent_signup_1: 'By signing up, you agree to our',
    qr_tag: 'QR CODES', qr_title: 'Need a QR code?',
    qr_sub: 'Convert any URL into a QR code instantly.',
    qr_placeholder: 'Paste any URL to convert...', qr_btn: 'Generate QR', qr_download: 'Download PNG',
    qr_tip: 'All QR codes route through j2z — edit destination anytime without reprinting.',
    bio_tag: 'BIO LINK', bio_title: 'Your links, one page.',
    bio_sub: 'A beautiful bio page at j2z.com/yourname. Showcase all your socials, products, or projects.',
    bio_cta: 'Sign up free to create yours',
    bio_preview_name: 'your name', bio_preview_desc: 'creator · designer · builder',
    bio_preview_link1: 'My Latest Project', bio_preview_link2: 'YouTube Channel',
    bio_preview_link3: 'Instagram', bio_preview_link4: 'Contact Me',
    hero_feat_tag: "THE ONE FEATURE YOU'LL REMEMBER",
    hero_feat_title_1: 'Print once.', hero_feat_title_2: 'Update forever.',
    hero_feat_sub: "Printed business cards with a QR code? Phone number changed? With J2z, you don't reprint. Just edit the destination. The code stays the same.",
    feat_1_title: 'The old way', feat_1_desc: 'QR is locked to one URL. Change it = reprint everything.',
    feat_2_title: 'The J2z way', feat_2_desc: 'QR stays, destination is yours to edit. Forever.',
    cta_title: 'Ready in 10 seconds.',
    cta_sub: 'Create your first short link right now. Sign up later if you love it.',
    cta_btn: 'Get started — free forever',
    footer_terms: 'Terms', footer_privacy: 'Privacy', footer_contact: 'Contact',
    footer_tagline: 'Smart links, free forever.', footer_rights: '© 2026 J2z. Made with care.',
    prompt_title: 'Love it? Keep going →',
    prompt_sub: 'Sign up free to create unlimited links & QR codes, track every click, and edit destinations anytime.',
    prompt_btn_google: 'Continue with Google',
    prompt_btn_email: 'Continue with email', prompt_close: 'Maybe later',
  },
  ar: {
    nav_signin: 'دخول', nav_signup: 'ابدأ الآن',
    hero_badge: '✦ اطبعها مرة. عدّلها للأبد.',
    hero_title_1: 'روابط ذكية،', hero_title_em: 'مجانية للأبد.',
    hero_sub: 'أقصر دومين ستحبه. روابط مختصرة بلا حدود مع تحليلات كاملة — مجاناً تماماً.',
    tool_placeholder: 'الصق رابطك الطويل هنا...', tool_btn: 'اختصر',
    tool_shortened: 'رابطك المختصر', tool_copy: 'نسخ', tool_copied: '✓ تم النسخ!',
    trust_1: 'بدون بطاقة ائتمان', trust_2: 'بدون حدود خفية', trust_3: 'بدون إعلانات',
    consent_use_1: 'باستخدامك للخدمة، فإنك توافق على', consent_terms: 'الشروط',
    consent_and: 'و', consent_privacy: 'سياسة الخصوصية', consent_signup_1: 'بالتسجيل، فإنك توافق على',
    qr_tag: 'أكواد QR', qr_title: 'تحتاج QR؟',
    qr_sub: 'حوّل أي رابط إلى كود QR فوراً.',
    qr_placeholder: 'الصق رابطاً لتحويله...', qr_btn: 'توليد QR', qr_download: 'تحميل PNG',
    qr_tip: 'كل أكواد QR تمر عبر j2z — عدّل الوجهة في أي وقت بدون إعادة طباعة.',
    bio_tag: 'بالنك بيو', bio_title: 'روابطك في صفحة واحدة.',
    bio_sub: 'صفحة بالنك جميلة على j2z.com/اسمك. اعرض حساباتك ومنتجاتك ومشاريعك.',
    bio_cta: 'سجّل مجاناً لإنشاء صفحتك',
    bio_preview_name: 'اسمك', bio_preview_desc: 'مبدع · مصمم · مطور',
    bio_preview_link1: 'أحدث مشروع لي', bio_preview_link2: 'قناة اليوتيوب',
    bio_preview_link3: 'إنستغرام', bio_preview_link4: 'تواصل معي',
    hero_feat_tag: 'الميزة التي ستتذكرها',
    hero_feat_title_1: 'اطبعها مرة.', hero_feat_title_2: 'عدّلها للأبد.',
    hero_feat_sub: 'طبعت كروت أعمال مع QR؟ تغيّر رقم جوالك؟ مع J2z، لا تطبع مرة ثانية. فقط عدّل الوجهة. الكود يبقى كما هو.',
    feat_1_title: 'الطريقة القديمة', feat_1_desc: 'QR مرتبط برابط واحد. تغييره = إعادة طباعة كل شيء.',
    feat_2_title: 'طريقة J2z', feat_2_desc: 'الكود يبقى، الوجهة تعدّلها متى شئت. للأبد.',
    cta_title: 'جاهز في ١٠ ثوانٍ.',
    cta_sub: 'أنشئ أول رابط مختصر الآن. سجّل لاحقاً إذا أعجبك.',
    cta_btn: 'ابدأ — مجاني للأبد',
    footer_terms: 'الشروط', footer_privacy: 'الخصوصية', footer_contact: 'تواصل',
    footer_tagline: 'روابط ذكية، مجانية للأبد.', footer_rights: '© ٢٠٢٦ J2z. صنّع بعناية.',
    prompt_title: 'أعجبك؟ واصل →',
    prompt_sub: 'سجّل مجاناً لإنشاء روابط وأكواد QR بلا حدود، تتبع كل نقرة، وعدّل الوجهات في أي وقت.',
    prompt_btn_google: 'متابعة عبر Google',
    prompt_btn_email: 'متابعة عبر الإيميل', prompt_close: 'لاحقاً',
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function J2zLanding() {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const [url, setUrl] = useState('')
  const [custom, setCustom] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [linkUsed, setLinkUsed] = useState(false)
  const [shortenLoading, setShortenLoading] = useState(false)
  const [shortenError, setShortenError] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [qrResult, setQrResult] = useState<string | null>(null)
  const [qrUsed, setQrUsed] = useState(false)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [linkNotFound, setLinkNotFound] = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const t = T[lang]

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('notfound=1')) {
      setLinkNotFound(true)
      window.history.replaceState({}, '', '/')
      setTimeout(() => setLinkNotFound(false), 5000)
    }
  }, [])

  useEffect(() => {
    if (qrResult && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, qrResult, {
        width: 200,
        margin: 1,
        color: { dark: '#2F2A24', light: '#FFFFFF' },
      })
    }
  }, [qrResult])

  const shorten = async () => {
    const u = url.trim()
    if (!u) return
    if (linkUsed) { setShowSignupPrompt(true); return }
    setShortenLoading(true)
    setShortenError('')
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u, customSlug: custom.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data.short_url)
        setCopied(false)
        setLinkUsed(true)
      } else {
        setShortenError(data.error || 'Something went wrong')
      }
    } catch {
      setShortenError('Network error — please try again')
    } finally {
      setShortenLoading(false)
    }
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateQR = async () => {
    const v = qrInput.trim()
    if (!v) return
    if (qrUsed) { setShowSignupPrompt(true); return }
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: v }),
      })
      const data = await res.json()
      if (res.ok) { setQrResult(data.short_url); setQrUsed(true) }
    } catch { /* ignore */ }
  }

  const downloadQR = () => {
    if (!qrCanvasRef.current) return
    const a = document.createElement('a')
    a.download = 'j2z-qr.png'
    a.href = qrCanvasRef.current.toDataURL()
    a.click()
  }

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
:root {
  --paper:#FBFAF7;--cream:#F5F2EC;--warm:#EFEAE0;
  --ink:#2F2A24;--ink-soft:#6B6257;--ink-mute:#A89F92;
  --border:#E8E2D6;--coral-deep:#D45A3F;--coral:#E8765C;
  --coral-light:#F4A593;--coral-soft:#FBEDE8;
  --sage:#8FA68E;--sage-soft:#EDF1EC;
  --butter:#E8C66B;--butter-soft:#FAF3DC;
  --shadow-sm:0 1px 3px rgba(47,42,36,0.06);
  --shadow-md:0 4px 16px rgba(47,42,36,0.08);
  --shadow-lg:0 12px 32px rgba(47,42,36,0.1);
}
*{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}
body{background:var(--paper);color:var(--ink);font-family:'Space Grotesk','Tajawal',sans-serif;-webkit-font-smoothing:antialiased;line-height:1.5;}
.nav{position:sticky;top:0;z-index:100;background:rgba(251,250,247,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.nav-inner{max-width:1100px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
.nav-logo{display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit;}
.nav-logo-name{font-size:22px;font-weight:700;letter-spacing:-.04em;}
.nav-actions{display:flex;gap:8px;align-items:center;}
.lang-btn{background:var(--cream);border:1px solid var(--border);padding:0 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:var(--ink);font-family:inherit;min-height:44px;display:inline-flex;align-items:center;}
.lang-btn:hover{background:var(--warm);}
.btn-signin{padding:0 14px;background:transparent;color:var(--ink);border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;min-height:44px;display:inline-flex;align-items:center;}
.btn-signin:hover{color:var(--coral-deep);}
.btn-signup{padding:0 18px;background:var(--ink);color:white;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s;min-height:44px;display:inline-flex;align-items:center;}
.btn-signup:hover{background:var(--coral-deep);transform:translateY(-1px);}
.hero{padding:48px 20px 32px;text-align:center;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:800px;height:500px;background:radial-gradient(ellipse,rgba(232,118,92,.08) 0%,transparent 60%);pointer-events:none;z-index:0;}
.hero-inner{max-width:780px;margin:0 auto;position:relative;z-index:1;}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:var(--coral-soft);color:var(--coral-deep);padding:6px 14px;border-radius:100px;font-size:12.5px;font-weight:600;margin-bottom:20px;border:1px solid rgba(232,118,92,.15);}
.hero h1{font-family:'Cal Sans','Tajawal',sans-serif;font-size:clamp(38px,6.5vw,64px);font-weight:700;line-height:1;letter-spacing:-.04em;margin-bottom:16px;}
.hero h1 em{font-style:normal;color:var(--coral-deep);position:relative;display:inline-block;}
.hero h1 em::after{content:'';position:absolute;bottom:4px;left:0;right:0;height:8px;background:var(--butter-soft);z-index:-1;border-radius:4px;}
.hero p{font-size:clamp(15px,1.8vw,17px);color:var(--ink-soft);max-width:580px;margin:0 auto 24px;line-height:1.55;}
.tool-box{background:white;border:1.5px solid var(--border);border-radius:16px;padding:10px;max-width:620px;margin:0 auto;box-shadow:var(--shadow-md);transition:all .2s;}
.tool-box:focus-within{border-color:var(--coral);box-shadow:0 0 0 4px var(--coral-soft);}
.tool-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.tool-input{flex:1;min-width:200px;border:none;outline:none;padding:12px 14px;font-size:16px;background:transparent;color:var(--ink);font-family:inherit;}
.tool-input::placeholder{color:var(--ink-mute);}
.tool-custom{display:flex;align-items:center;gap:4px;padding:6px 12px;background:var(--cream);border-radius:8px;border:1px solid var(--border);font-size:13px;}
.tool-custom-prefix{font-family:monospace;color:var(--ink-mute);font-size:12px;}
.tool-custom-input{border:none;outline:none;background:transparent;font-size:16px;color:var(--ink);font-family:monospace;width:90px;font-weight:600;}
.tool-btn{padding:12px 22px;background:var(--coral);color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;}
.tool-btn:hover{background:var(--coral-deep);transform:translateY(-1px);}
.tool-btn:disabled{background:var(--ink-mute);cursor:not-allowed;transform:none;}
.consent{margin-top:10px;font-size:11.5px;color:var(--ink-mute);text-align:center;line-height:1.5;}
.consent a{color:var(--coral-deep);text-decoration:underline;cursor:pointer;font-weight:500;}.consent a:hover{color:var(--coral);}
.tool-result{margin-top:12px;padding:16px 18px;background:linear-gradient(135deg,var(--sage-soft),var(--coral-soft));border:1px solid var(--sage);border-radius:12px;animation:slideIn .3s ease;}
@keyframes slideIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
.tool-result-label{font-size:10.5px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:1.2px;font-weight:700;margin-bottom:6px;}
.tool-result-row{display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap;}
.tool-result-url{font-family:monospace;font-size:17px;font-weight:700;color:var(--coral-deep);text-decoration:none;}
.tool-result-url:hover{text-decoration:underline;}
.tool-copy-btn{padding:7px 14px;background:var(--ink);color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;}
.tool-copy-btn.copied{background:var(--sage);}
.tool-error{margin-top:8px;padding:8px 12px;background:#FDEAEA;border:1px solid #F4A593;border-radius:8px;font-size:13px;color:#C03030;}
.hero-trust{margin-top:18px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}
.trust-item{display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink-soft);font-weight:500;}
.trust-item .check{color:var(--sage);font-weight:700;}
.section{padding:40px 20px;}.section-dark{background:var(--ink);color:white;padding:50px 20px;}.section-cream{background:var(--cream);}.section-sage{background:var(--sage-soft);}
.section-inner{max-width:1040px;margin:0 auto;}
.section-head{text-align:center;margin-bottom:24px;}
.section-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--coral-deep);background:var(--coral-soft);padding:5px 11px;border-radius:6px;margin-bottom:10px;text-transform:uppercase;}
.section-dark .section-tag{background:rgba(232,118,92,.2);color:var(--coral-light);}
.section h2{font-family:'Cal Sans','Tajawal',sans-serif;font-size:clamp(26px,3.8vw,38px);font-weight:700;line-height:1.1;letter-spacing:-.03em;margin-bottom:8px;}
.section-sub{font-size:15px;color:var(--ink-soft);max-width:520px;margin:0 auto;line-height:1.55;}
.section-dark .section-sub{color:rgba(255,255,255,.7);}
.qr-box{background:white;border:1.5px solid var(--border);border-radius:16px;padding:18px;max-width:620px;margin:0 auto;box-shadow:var(--shadow-md);}
.qr-input-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.qr-input{flex:1;min-width:200px;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;outline:none;font-size:16px;color:var(--ink);font-family:inherit;background:var(--paper);transition:all .15s;}
.qr-input:focus{border-color:var(--coral);}
.qr-input::placeholder{color:var(--ink-mute);}
.qr-result-wrap{display:flex;gap:20px;align-items:center;margin-top:14px;padding:16px;background:var(--coral-soft);border-radius:12px;flex-wrap:wrap;justify-content:center;}
.qr-canvas-box{background:white;padding:8px;border-radius:10px;box-shadow:var(--shadow-sm);}
.qr-info{flex:1;min-width:180px;}
.qr-info-label{font-size:10.5px;color:var(--coral-deep);text-transform:uppercase;letter-spacing:1.2px;font-weight:700;margin-bottom:5px;}
.qr-info-url{font-family:monospace;font-size:15px;font-weight:700;color:var(--coral-deep);margin-bottom:12px;}
.qr-dl-btn{padding:9px 16px;background:var(--ink);color:white;border:none;border-radius:8px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:7px;min-height:40px;}
.qr-dl-btn:hover{background:var(--coral-deep);}
.qr-tip{margin-top:12px;padding:10px 14px;background:var(--sage-soft);border-radius:10px;font-size:12.5px;color:#3E5F3C;line-height:1.5;}
.bio-wrap{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center;max-width:900px;margin:0 auto;}
@media(max-width:720px){.bio-wrap{grid-template-columns:1fr;gap:24px;}}
.bio-text h3{font-family:'Cal Sans','Tajawal',sans-serif;font-size:clamp(22px,3vw,28px);font-weight:700;line-height:1.15;letter-spacing:-.02em;margin-bottom:10px;}
.bio-text p{font-size:15px;color:var(--ink-soft);line-height:1.55;margin-bottom:16px;}
.bio-cta-btn{padding:12px 22px;background:var(--ink);color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;display:inline-flex;align-items:center;gap:8px;}
.bio-cta-btn:hover{background:var(--coral-deep);transform:translateY(-1px);}
.bio-preview{background:linear-gradient(145deg,var(--ink) 0%,#1E1A14 100%);border-radius:20px;padding:26px 22px;color:white;text-align:center;box-shadow:var(--shadow-lg);position:relative;overflow:hidden;}
.bio-preview::before{content:'';position:absolute;top:-30%;left:-20%;width:400px;height:400px;background:radial-gradient(circle,rgba(232,118,92,.2),transparent 60%);pointer-events:none;}
.bio-avi{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,var(--coral) 0%,var(--butter) 100%);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;}
.bio-name{font-family:'Cal Sans',sans-serif;font-size:16px;font-weight:700;margin-bottom:3px;position:relative;z-index:1;}
.bio-desc{font-size:11.5px;color:rgba(255,255,255,.6);margin-bottom:14px;position:relative;z-index:1;}
.bio-links{display:flex;flex-direction:column;gap:7px;max-width:240px;margin:0 auto;position:relative;z-index:1;}
.bio-link-btn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:10px 13px;color:white;font-size:12.5px;font-weight:500;backdrop-filter:blur(8px);transition:all .2s;cursor:pointer;}
.bio-link-btn:hover{background:rgba(255,255,255,.18);transform:translateY(-1px);}
.bio-url-tag{margin-top:14px;font-family:monospace;font-size:10.5px;color:rgba(255,255,255,.5);position:relative;z-index:1;}
.bio-url-tag strong{color:var(--coral-light);font-weight:600;}
.hero-feat{text-align:center;}
.hero-feat h2{color:white;max-width:700px;margin:0 auto 12px;}
.hero-feat h2 em{font-style:normal;color:var(--coral-light);}
.feat-compare{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px;max-width:700px;margin-left:auto;margin-right:auto;}
.feat-box{padding:20px 22px;border-radius:14px;text-align:left;}
[dir=rtl] .feat-box{text-align:right;}
.feat-box.bad{background:rgba(255,255,255,.05);border:1px dashed rgba(255,255,255,.2);}
.feat-box.good{background:var(--coral-soft);border:1px solid var(--coral);color:var(--ink);}
.feat-box-label{font-size:10.5px;text-transform:uppercase;letter-spacing:1.8px;font-weight:700;margin-bottom:8px;}
.feat-box.bad .feat-box-label{color:rgba(255,255,255,.5);}
.feat-box.good .feat-box-label{color:var(--coral-deep);}
.feat-box h4{font-family:'Cal Sans',sans-serif;font-size:16px;font-weight:700;margin-bottom:5px;}
.feat-box.bad h4{color:rgba(255,255,255,.85);}
.feat-box.bad h4::before{content:"✕ ";color:#FF6B6B;}
.feat-box.good h4::before{content:"✓ ";color:var(--sage);}
.feat-box p{font-size:13px;line-height:1.5;}
.feat-box.bad p{color:rgba(255,255,255,.6);}
@media(max-width:640px){.feat-compare{grid-template-columns:1fr;}}
.cta{text-align:center;padding:70px 20px;background:linear-gradient(135deg,var(--coral-soft) 0%,var(--butter-soft) 100%);position:relative;overflow:hidden;}.cta::before{content:'';position:absolute;top:-100px;left:-100px;width:400px;height:400px;background:radial-gradient(circle,var(--coral) 0%,transparent 60%);opacity:0.1;}.cta::after{content:'';position:absolute;bottom:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,var(--sage) 0%,transparent 60%);opacity:0.15;}
.cta-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
.cta h2{font-family:'Cal Sans','Tajawal',sans-serif;font-size:clamp(30px,4.5vw,44px);font-weight:700;line-height:1;letter-spacing:-.04em;margin-bottom:12px;}
.cta p{font-size:16px;color:var(--ink-soft);margin-bottom:22px;}
.cta-btn{padding:15px 30px;background:var(--ink);color:white;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 8px 24px rgba(47,42,36,.2);}
.cta-btn:hover{background:var(--coral-deep);transform:translateY(-2px);}
.cta-consent{margin-top:14px;font-size:11.5px;color:var(--ink-soft);line-height:1.5;}
.cta-consent a{color:var(--coral-deep);text-decoration:underline;cursor:pointer;font-weight:600;}
.footer{padding:40px 20px 24px;background:var(--ink);color:white;}
.footer-inner{max-width:1040px;margin:0 auto;display:flex;justify-content:space-between;align-items:flex-start;gap:32px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:16px;}
.footer-brand{flex:1;min-width:220px;}
.footer-logo-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.footer-logo-name{font-size:20px;font-weight:700;color:white;letter-spacing:-.04em;}
.footer-tagline{font-size:13px;color:rgba(255,255,255,.6);}
.footer-links{display:flex;gap:24px;flex-wrap:wrap;align-items:center;}
.footer-link{font-size:13px;color:rgba(255,255,255,.7);text-decoration:none;font-weight:500;}
.footer-link:hover{color:var(--coral-light);}
.footer-bottom{text-align:center;font-size:11.5px;color:rgba(255,255,255,.4);}
.prompt-overlay{position:fixed;inset:0;background:rgba(47,42,36,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.prompt-box{background:white;border-radius:20px;max-width:420px;width:100%;padding:32px 28px 24px;box-shadow:0 25px 60px rgba(47,42,36,.3);animation:popIn .3s cubic-bezier(.34,1.56,.64,1);text-align:center;}
@keyframes popIn{from{opacity:0;transform:scale(.92) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}
.prompt-icon{width:60px;height:60px;margin:0 auto 16px;background:var(--coral-soft);border-radius:16px;display:flex;align-items:center;justify-content:center;}
.prompt-title{font-family:'Cal Sans',sans-serif;font-size:22px;font-weight:700;letter-spacing:-.02em;margin-bottom:8px;}
.prompt-sub{font-size:14px;color:var(--ink-soft);line-height:1.55;margin-bottom:22px;}
.prompt-btns{display:flex;flex-direction:column;gap:8px;}
.prompt-btn{padding:11px 18px;border-radius:10px;border:1.5px solid var(--border);background:white;color:var(--ink);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;min-height:48px;}
.prompt-btn:hover{border-color:var(--coral);background:var(--coral-soft);}
.prompt-btn.primary{background:var(--ink);color:white;border-color:var(--ink);}
.prompt-btn.primary:hover{background:var(--coral-deep);border-color:var(--coral-deep);}
.prompt-consent{margin-top:14px;font-size:11px;color:var(--ink-mute);line-height:1.5;}
.prompt-consent a{color:var(--coral-deep);text-decoration:underline;font-weight:600;cursor:pointer;}
.prompt-close{margin-top:10px;background:none;border:none;color:var(--ink-mute);font-size:13px;cursor:pointer;font-family:inherit;text-decoration:underline;min-height:44px;padding:0 8px;}
.prompt-close:hover{color:var(--ink);}
.notfound-bar{position:fixed;top:72px;left:50%;transform:translateX(-50%);z-index:150;background:#2F2A24;color:white;padding:10px 20px;border-radius:10px;font-size:13.5px;font-weight:500;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(47,42,36,.25);animation:slideIn .3s ease;white-space:nowrap;}
.notfound-bar svg{flex-shrink:0;}
button,a{touch-action:manipulation;}
.tool-btn:active,.bio-cta-btn:active,.cta-btn:active,.btn-signup:active,.qr-dl-btn:active{transform:scale(0.97) translateY(0)!important;transition-duration:0.05s!important;}
.tool-copy-btn:active,.btn-s:active,.prompt-btn:active{transform:scale(0.97)!important;transition-duration:0.05s!important;}
button:focus-visible,a:focus-visible{outline:2px solid var(--coral);outline-offset:2px;border-radius:4px;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}}
.hero-demo-wrap{max-width:580px;margin:18px auto 0;}
.hero-demo{display:flex;align-items:center;gap:10px;background:white;border:1.5px solid var(--border);border-radius:12px;padding:11px 16px;box-shadow:var(--shadow-sm);overflow:hidden;}
.demo-before{font-family:monospace;color:var(--ink-mute);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;}
.demo-arrow-box{flex-shrink:0;width:26px;height:26px;background:var(--coral-soft);border-radius:7px;display:flex;align-items:center;justify-content:center;}
.demo-after{font-family:monospace;color:var(--coral-deep);font-weight:700;white-space:nowrap;font-size:13px;}
.demo-after span{color:var(--coral);}
.stats-strip{padding:20px 20px;background:var(--paper);border-bottom:1px solid var(--border);}
.stats-inner{max-width:660px;margin:0 auto;display:flex;justify-content:center;align-items:center;flex-wrap:wrap;}
.stat-item{text-align:center;padding:8px 32px;position:relative;}
.stat-item:not(:last-child)::after{content:'';position:absolute;right:0;top:50%;transform:translateY(-50%);height:28px;width:1px;background:var(--border);}
[dir=rtl] .stat-item:not(:last-child)::after{right:auto;left:0;}
.stat-num{display:block;font-family:'Cal Sans','Tajawal',sans-serif;font-size:26px;font-weight:700;color:var(--coral-deep);letter-spacing:-.03em;line-height:1.1;}
.stat-label{display:block;font-size:12px;color:var(--ink-mute);margin-top:2px;font-weight:500;}
@media(max-width:480px){.stat-item{padding:6px 16px;}.stat-item:not(:last-child)::after{display:none;}}
`

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} suppressHydrationWarning/>
      <div dir={dir}>
        {linkNotFound && (
          <div className="notfound-bar" role="alert">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/><line x1="10" y1="14" x2="10" y2="14"/></svg>
            {lang === 'ar' ? 'هذا الرابط غير موجود أو تم إيقافه.' : 'This link does not exist or has been deactivated.'}
          </div>
        )}
        <nav className="nav">
          <div className="nav-inner">
            <a className="nav-logo" href="#top">
              <Logo s={34}/>
              <span className="nav-logo-name">J2z</span>
            </a>
            <div className="nav-actions">
              <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} aria-label="Switch language">
                {lang === 'en' ? 'العربية' : 'English'}
              </button>
              <button className="btn-signin" onClick={() => window.location.href = '/auth'}>{t.nav_signin}</button>
              <button className="btn-signup" onClick={() => window.location.href = '/auth'}>{t.nav_signup}</button>
            </div>
          </div>
        </nav>

        <section className="hero" id="top">
          <div className="hero-inner">
            <div className="hero-badge">{t.hero_badge}</div>
            <h1>{t.hero_title_1}<br/><em>{t.hero_title_em}</em></h1>
            <p>{t.hero_sub}</p>

            <div className="tool-box">
              <div className="tool-row">
                <input
                  className="tool-input"
                  type="url"
                  placeholder={t.tool_placeholder}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && shorten()}
                  dir="ltr"
                  aria-label={t.tool_placeholder}
                />
                <div className="tool-custom">
                  <span className="tool-custom-prefix">j2z.com/</span>
                  <input
                    className="tool-custom-input"
                    type="text"
                    placeholder="custom"
                    value={custom}
                    onChange={e => setCustom(e.target.value.replace(/\s/g, ''))}
                    dir="ltr"
                    aria-label="Custom path"
                  />
                </div>
                <button className="tool-btn" onClick={shorten} disabled={shortenLoading}>
                  {shortenLoading ? '...' : `${t.tool_btn} →`}
                </button>
              </div>
              {shortenError && <div className="tool-error" role="alert">{shortenError}</div>}
              {result && (
                <div className="tool-result">
                  <div className="tool-result-label">{t.tool_shortened}</div>
                  <div className="tool-result-row">
                    <a
                      className="tool-result-url"
                      href={result}
                      target="_blank"
                      rel="noopener noreferrer"
                    >{result}</a>
                    <button className={`tool-copy-btn ${copied ? 'copied' : ''}`} onClick={copyResult}>
                      {copied ? t.tool_copied : t.tool_copy}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="consent">
              {t.consent_use_1} <a href="/terms">{t.consent_terms}</a> {t.consent_and} <a href="/privacy">{t.consent_privacy}</a>.
            </div>
            <div className="hero-trust">
              <span className="trust-item"><span className="check" aria-hidden="true">✓</span> {t.trust_1}</span>
              <span className="trust-item"><span className="check" aria-hidden="true">✓</span> {t.trust_2}</span>
              <span className="trust-item"><span className="check" aria-hidden="true">✓</span> {t.trust_3}</span>
            </div>
            <div className="hero-demo-wrap">
              <div className="hero-demo" aria-hidden="true">
                <span className="demo-before">https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=social&ref=home</span>
                <div className="demo-arrow-box">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--coral-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
                <span className="demo-after">j2z.com/<span>yt-vid</span></span>
              </div>
            </div>
          </div>
        </section>

        <div className="stats-strip">
          <div className="stats-inner">
            {[
              {num:'10K+', ar:'+١٠ آلاف', label:'Links created', ar_label:'رابط أُنشئ'},
              {num:'190+', ar:'+١٩٠', label:'Countries', ar_label:'دولة'},
              {num:'100%', ar:'١٠٠٪', label:'Free forever', ar_label:'مجاني للأبد'},
            ].map((s,i) => (
              <div key={i} className="stat-item">
                <span className="stat-num">{lang === 'en' ? s.num : s.ar}</span>
                <span className="stat-label">{lang === 'en' ? s.label : s.ar_label}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="section section-cream" id="qr">
          <div className="section-inner">
            <div className="section-head">
              <div className="section-tag"><QRIcon s={12} color="#D45A3F"/><span>{t.qr_tag}</span></div>
              <h2>{t.qr_title}</h2>
              <p className="section-sub">{t.qr_sub}</p>
            </div>
            <div className="qr-box">
              <div className="qr-input-row">
                <input
                  className="qr-input"
                  type="url"
                  placeholder={t.qr_placeholder}
                  value={qrInput}
                  onChange={e => setQrInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateQR()}
                  dir="ltr"
                  aria-label={t.qr_placeholder}
                />
                <button className="tool-btn" onClick={generateQR}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                    <QRIcon s={14} color="white"/> {t.qr_btn}
                  </span>
                </button>
              </div>
              {qrResult && (
                <div className="qr-result-wrap">
                  <div className="qr-canvas-box">
                    <canvas ref={qrCanvasRef} style={{display:'block',width:140,height:140,imageRendering:'pixelated'}}/>
                  </div>
                  <div className="qr-info">
                    <div className="qr-info-label">{lang === 'en' ? 'Routes to' : 'يحوّل إلى'}</div>
                    <div className="qr-info-url">{qrResult}</div>
                    <button className="qr-dl-btn" onClick={downloadQR}>
                      <IcoDownload s={14} c="white"/> {t.qr_download}
                    </button>
                  </div>
                </div>
              )}
              <div className="qr-tip">{t.qr_tip}</div>
            </div>
          </div>
        </section>

        <section className="section section-sage" id="bio">
          <div className="section-inner">
            <div className="section-head">
              <div className="section-tag">{t.bio_tag}</div>
              <h2>{t.bio_title}</h2>
              <p className="section-sub">{t.bio_sub}</p>
            </div>
            <div className="bio-wrap">
              <div className="bio-text">
                <h3>{lang === 'en' ? 'A homepage for everything you do.' : 'صفحة رئيسية لكل ما تفعله.'}</h3>
                <p>{lang === 'en'
                  ? 'Put all your links in one beautiful page. Share one URL that connects people to everything — your site, socials, shop, content.'
                  : 'ضع كل روابطك في صفحة واحدة جميلة. شارك رابطاً واحداً يصل الناس لكل شيء — موقعك، حساباتك، متجرك، محتواك.'
                }</p>
                <button className="bio-cta-btn" onClick={() => setShowSignupPrompt(true)}>{t.bio_cta} →</button>
              </div>
              <div className="bio-preview" aria-hidden="true">
                <div className="bio-avi"><BioAvatarIcon /></div>
                <div className="bio-name">{t.bio_preview_name}</div>
                <div className="bio-desc">{t.bio_preview_desc}</div>
                <div className="bio-links">
                  {[t.bio_preview_link1,t.bio_preview_link2,t.bio_preview_link3,t.bio_preview_link4].map((l,i)=>(
                    <div key={i} className="bio-link-btn">{l}</div>
                  ))}
                </div>
                <div className="bio-url-tag">j2z.com/<strong>{lang === 'en' ? 'yourname' : 'اسمك'}</strong></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-dark">
          <div className="section-inner hero-feat">
            <div className="section-tag">{t.hero_feat_tag}</div>
            <h2>{t.hero_feat_title_1} <em>{t.hero_feat_title_2}</em></h2>
            <p className="section-sub">{t.hero_feat_sub}</p>
            <div className="feat-compare">
              <div className="feat-box bad">
                <div className="feat-box-label">{lang === 'en' ? 'The old way' : 'الطريقة القديمة'}</div>
                <h4>{t.feat_1_title}</h4><p>{t.feat_1_desc}</p>
              </div>
              <div className="feat-box good">
                <div className="feat-box-label">{lang === 'en' ? 'The J2z way' : 'طريقة J2z'}</div>
                <h4>{t.feat_2_title}</h4><p>{t.feat_2_desc}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta" id="cta">
          <div className="cta-inner">
            <h2>{t.cta_title}</h2>
            <p>{t.cta_sub}</p>
            <button className="cta-btn" onClick={() => setShowSignupPrompt(true)}>{t.cta_btn} →</button>
            <div className="cta-consent">
              {t.consent_signup_1} <a href="/terms">{t.consent_terms}</a> {t.consent_and} <a href="/privacy">{t.consent_privacy}</a>.
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-logo-row"><Logo s={32}/><span className="footer-logo-name">J2z</span></div>
              <div className="footer-tagline">{t.footer_tagline}</div>
            </div>
            <div className="footer-links">
              <a className="footer-link" href="/terms">{t.footer_terms}</a>
              <a className="footer-link" href="/privacy">{t.footer_privacy}</a>
              <a className="footer-link" href="mailto:legal@j2z.com">{t.footer_contact}</a>
            </div>
          </div>
          <div className="footer-bottom">{t.footer_rights}</div>
        </footer>

        {showSignupPrompt && (
          <div className="prompt-overlay" onClick={() => setShowSignupPrompt(false)} role="dialog" aria-modal="true" aria-label="Sign up">
            <div className="prompt-box" onClick={e => e.stopPropagation()} dir={dir}>
              <div className="prompt-icon"><Logo s={36}/></div>
              <div className="prompt-title">{t.prompt_title}</div>
              <div className="prompt-sub">{t.prompt_sub}</div>
              <div className="prompt-btns">
                <button className="prompt-btn primary" onClick={() => window.location.href='/auth'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t.prompt_btn_google}
                </button>
                <button className="prompt-btn" onClick={() => window.location.href='/auth'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F2A24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {t.prompt_btn_email}
                </button>
              </div>
              <div className="prompt-consent">
                {t.consent_signup_1} <a href="/terms">{t.consent_terms}</a> {t.consent_and} <a href="/privacy">{t.consent_privacy}</a>.
              </div>
              <button className="prompt-close" onClick={() => setShowSignupPrompt(false)}>{t.prompt_close}</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
