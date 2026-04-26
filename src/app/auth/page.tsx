'use client'
export const dynamic = 'force-dynamic'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signup' | 'signin' | 'email-signup' | 'email-signin' | 'verify' | 'dashboard-preview'
type Lang = 'en' | 'ar'

export default function J2zAuth() {
  const [lang, setLang] = useState<Lang>('en')
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  const Logo = ({ s = 44 }: { s?: number }) => (
    <svg viewBox="0 0 60 60" width={s} height={s} fill="none">
      <rect x="0" y="0" width="60" height="60" rx="16" fill="#FBEDE8"/>
      <rect x="28" y="16" width="5" height="20" fill="#F4A593"/>
      <rect x="33" y="13" width="5" height="23" fill="#E8765C"/>
      <rect x="38" y="10" width="5" height="26" fill="#D45A3F"/>
      <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593"/>
      <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F"/>
    </svg>
  )

  const T = {
    en: {
      back_home: '← Back to J2z.com', lang_toggle: 'العربية',
      signup_headline: 'Create your account', signup_sub: 'Free forever. No credit card needed.',
      signup_google: 'Continue with Google', signup_apple: 'Continue with Apple', signup_email: 'Continue with email',
      or: 'or', already: 'Already have an account?', signin_link: 'Sign in',
      signin_headline: 'Welcome back', signin_sub: 'Good to see you again.',
      signin_google: 'Sign in with Google', signin_apple: 'Sign in with Apple', signin_email: 'Sign in with email',
      no_account: "Don't have an account?", signup_link: 'Sign up free',
      email_signup_headline: 'Create your account',
      name_label: 'Your name', name_ph: 'Ahmed Al-Rashid',
      email_label: 'Email address', email_ph: 'you@example.com',
      pass_label: 'Password', pass_ph: 'At least 8 characters',
      create_btn: 'Create account →',
      terms: 'By signing up, you agree to our', terms_link: 'Terms & Privacy Policy',
      email_signin_headline: 'Sign in to J2z', email_signin_sub: 'Enter your credentials to continue.',
      signin_btn: 'Sign in →', forgot: 'Forgot password?',
      verify_headline: 'Check your inbox', verify_sub_1: 'We sent a verification link to',
      verify_sub_2: 'Click the link to activate your account.',
      resend: 'Resend email', resent: '✓ Sent!', change_email: 'Use a different email',
      loading_google: 'Connecting to Google...', loading_apple: 'Connecting to Apple...',
      benefit_headline: "Everything you need, nothing you don't.",
      b1_title: 'Unlimited short links', b1_desc: 'Create as many as you need. No monthly caps.',
      b2_title: 'QR codes that evolve', b2_desc: 'Print once, edit destination forever.',
      b3_title: 'Free analytics', b3_desc: 'Clicks, countries, devices — all free.',
      b4_title: 'Bio link page', b4_desc: 'One link for all your socials at j2z.com/you',
      tagline: 'Print once. Update forever.',
    },
    ar: {
      back_home: '← العودة إلى J2z.com', lang_toggle: 'English',
      signup_headline: 'أنشئ حسابك', signup_sub: 'مجاني للأبد. بدون بطاقة ائتمان.',
      signup_google: 'المتابعة عبر Google', signup_apple: 'المتابعة عبر Apple', signup_email: 'المتابعة عبر الإيميل',
      or: 'أو', already: 'لديك حساب بالفعل؟', signin_link: 'تسجيل الدخول',
      signin_headline: 'أهلاً بعودتك', signin_sub: 'يسعدنا رؤيتك مجدداً.',
      signin_google: 'الدخول عبر Google', signin_apple: 'الدخول عبر Apple', signin_email: 'الدخول عبر الإيميل',
      no_account: 'ليس لديك حساب؟', signup_link: 'سجّل مجاناً',
      email_signup_headline: 'أنشئ حسابك',
      name_label: 'اسمك', name_ph: 'أحمد الراشد',
      email_label: 'البريد الإلكتروني', email_ph: 'you@example.com',
      pass_label: 'كلمة المرور', pass_ph: '٨ أحرف على الأقل',
      create_btn: 'إنشاء الحساب →',
      terms: 'بالتسجيل، أنت توافق على', terms_link: 'الشروط وسياسة الخصوصية',
      email_signin_headline: 'الدخول إلى J2z', email_signin_sub: 'أدخل بياناتك للمتابعة.',
      signin_btn: 'الدخول →', forgot: 'نسيت كلمة المرور؟',
      verify_headline: 'تحقق من بريدك', verify_sub_1: 'أرسلنا رابط تفعيل إلى',
      verify_sub_2: 'اضغط على الرابط لتفعيل حسابك.',
      resend: 'إعادة الإرسال', resent: '✓ تم الإرسال!', change_email: 'استخدام بريد آخر',
      loading_google: 'جاري الاتصال بـ Google...', loading_apple: 'جاري الاتصال بـ Apple...',
      benefit_headline: 'كل ما تحتاج، بدون زيادة.',
      b1_title: 'روابط مختصرة بلا حدود', b1_desc: 'أنشئ بقدر ما تريد. بدون سقف شهري.',
      b2_title: 'أكواد QR قابلة للتحديث', b2_desc: 'اطبع مرة، عدّل الوجهة للأبد.',
      b3_title: 'تحليلات مجانية', b3_desc: 'نقرات، دول، أجهزة — كلها مجانية.',
      b4_title: 'صفحة البالنك', b4_desc: 'رابط واحد لكل حساباتك على j2z.com/أنت',
      tagline: 'اطبعها مرة. عدّلها للأبد.',
    },
  }
  const t = T[lang]

  const benefits = [
    { icon: '🔗', title: t.b1_title, desc: t.b1_desc },
    { icon: '⬛', title: t.b2_title, desc: t.b2_desc },
    { icon: '📊', title: t.b3_title, desc: t.b3_desc },
    { icon: '✨', title: t.b4_title, desc: t.b4_desc },
  ]

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://j2z.com')

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(provider)
    setError('')
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${siteUrl}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(null) }
  }

  const handleEmailSignup = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading('email')
    setError('')
    const { error } = await getSupabase().auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: `${siteUrl}/auth/callback` },
    })
    setLoading(null)
    if (error) setError(error.message)
    else setMode('verify')
  }

  const handleEmailSignin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading('email')
    setError('')
    const { error } = await getSupabase().auth.signInWithPassword({ email, password })
    setLoading(null)
    if (error) setError(error.message)
    else window.location.href = '/dashboard'
  }

  const handleResend = async () => {
    await getSupabase().auth.resend({ type: 'signup', email })
    setResent(true)
    setTimeout(() => setResent(false), 3000)
  }

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
  const AppleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--ink)">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )
  const EmailIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  )
  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
:root{--paper:#FBFAF7;--cream:#F5F2EC;--warm:#EFEAE0;--ink:#2F2A24;--ink-soft:#6B6257;--ink-mute:#A89F92;--border:#E8E2D6;--coral-deep:#D45A3F;--coral:#E8765C;--coral-light:#F4A593;--coral-soft:#FBEDE8;--sage:#8FA68E;--sage-soft:#EDF1EC;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--paper);color:var(--ink);font-family:'Space Grotesk','Tajawal',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
.auth-wrap{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;}
@media(max-width:800px){.auth-wrap{grid-template-columns:1fr;}.right-panel{display:none;}}
.left-panel{display:flex;flex-direction:column;padding:28px 32px;background:var(--paper);max-width:560px;width:100%;justify-self:center;}
@media(max-width:800px){.left-panel{max-width:100%;padding:20px;}}
.top-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px;}
.back-link{font-size:13px;color:var(--ink-soft);cursor:pointer;font-weight:500;text-decoration:none;display:flex;align-items:center;gap:4px;transition:color .15s;}
.back-link:hover{color:var(--coral-deep);}
.top-bar-right{display:flex;align-items:center;gap:10px;}
.logo-row{display:flex;align-items:center;gap:8px;cursor:pointer;}
.logo-name{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;letter-spacing:-.04em;}
.lang-btn{background:var(--cream);border:1px solid var(--border);padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:var(--ink);font-family:inherit;}
.lang-btn:hover{background:var(--warm);}
.form-area{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:380px;width:100%;margin:0 auto;animation:fadeUp .3s ease;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
.form-headline{font-family:'Cal Sans','Tajawal',sans-serif;font-size:clamp(26px,4vw,34px);font-weight:700;letter-spacing:-.03em;margin-bottom:6px;line-height:1.1;}
.form-sub{font-size:15px;color:var(--ink-soft);margin-bottom:28px;}
.oauth-stack{display:flex;flex-direction:column;gap:10px;margin-bottom:22px;}
.oauth-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:13px 20px;background:white;border:1.5px solid var(--border);border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--ink);transition:all .2s;position:relative;overflow:hidden;}
.oauth-btn:hover{border-color:var(--coral-light);background:var(--coral-soft);transform:translateY(-1px);box-shadow:0 4px 12px rgba(232,118,92,.1);}
.oauth-btn.loading{color:var(--ink-mute);cursor:not-allowed;pointer-events:none;}
.oauth-btn.email-btn{border-color:var(--ink);background:var(--ink);color:white;}
.oauth-btn.email-btn:hover{background:var(--coral-deep);border-color:var(--coral-deep);}
.oauth-spin{width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--coral);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg);}}
.divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:var(--ink-mute);font-size:12px;font-weight:500;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}
.field-group{margin-bottom:14px;}
.field-label{display:block;font-size:13px;font-weight:600;color:var(--ink);margin-bottom:6px;}
.field-input{width:100%;padding:13px 14px;background:white;border:1.5px solid var(--border);border-radius:10px;font-size:15px;color:var(--ink);font-family:inherit;outline:none;transition:all .15s;}
.field-input:focus{border-color:var(--coral);box-shadow:0 0 0 4px var(--coral-soft);}
.field-input::placeholder{color:var(--ink-mute);}
.pass-wrap{position:relative;}
.pass-wrap .field-input{padding-right:46px;}
[dir=rtl] .pass-wrap .field-input{padding-right:14px;padding-left:46px;}
.pass-eye{position:absolute;top:50%;right:14px;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--ink-mute);padding:4px;display:flex;align-items:center;justify-content:center;transition:color .15s;}
[dir=rtl] .pass-eye{right:auto;left:14px;}
.pass-eye:hover{color:var(--coral);}
.forgot-link{display:block;text-align:right;font-size:12.5px;color:var(--ink-soft);cursor:pointer;margin-top:6px;text-decoration:none;}
[dir=rtl] .forgot-link{text-align:left;}
.forgot-link:hover{color:var(--coral-deep);}
.submit-btn{width:100%;padding:14px;background:var(--coral);color:white;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;margin-top:6px;box-shadow:0 4px 12px rgba(232,118,92,.25);}
.submit-btn:hover{background:var(--coral-deep);transform:translateY(-1px);}
.submit-btn:disabled{background:var(--ink-mute);cursor:not-allowed;transform:none;box-shadow:none;}
.terms-text{font-size:11.5px;color:var(--ink-mute);text-align:center;margin-top:12px;line-height:1.5;}
.terms-text a{color:var(--coral-deep);cursor:pointer;text-decoration:underline;}
.switch-mode{text-align:center;margin-top:20px;font-size:14px;color:var(--ink-soft);}
.switch-link{color:var(--coral-deep);font-weight:700;cursor:pointer;text-decoration:none;}
.switch-link:hover{text-decoration:underline;}
.back-to-options{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink-soft);cursor:pointer;margin-bottom:20px;font-weight:500;background:none;border:none;font-family:inherit;padding:0;}
.back-to-options:hover{color:var(--coral-deep);}
.verify-wrap{text-align:center;}
.verify-icon{width:72px;height:72px;background:var(--sage-soft);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px;}
.verify-email-chip{display:inline-block;background:var(--cream);border:1px solid var(--border);border-radius:8px;padding:6px 14px;font-family:monospace;font-size:14px;font-weight:600;color:var(--coral-deep);margin:8px 0 18px;}
.resend-btn{background:none;border:1.5px solid var(--border);padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--ink);transition:all .15s;margin-top:4px;}
.resend-btn:hover{border-color:var(--sage);background:var(--sage-soft);}
.resend-btn.sent{color:var(--sage);border-color:var(--sage);}
.change-email-link{display:block;margin-top:14px;font-size:13px;color:var(--ink-mute);cursor:pointer;text-decoration:underline;}
.change-email-link:hover{color:var(--coral-deep);}
.error-msg{padding:10px 14px;background:#FDEAEA;border:1px solid #F4A593;border-radius:10px;font-size:13px;color:#C03030;margin-bottom:14px;}
.right-panel{background:var(--ink);display:flex;flex-direction:column;justify-content:center;padding:60px 48px;position:relative;overflow:hidden;}
.right-panel::before{content:'';position:absolute;top:-100px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(232,118,92,.18) 0%,transparent 60%);pointer-events:none;}
.right-inner{position:relative;z-index:1;}
.right-logo{display:flex;align-items:center;gap:10px;margin-bottom:48px;}
.right-logo-name{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:white;letter-spacing:-.04em;}
.right-headline{font-family:'Cal Sans','Tajawal',sans-serif;font-size:clamp(22px,2.8vw,32px);font-weight:700;color:white;line-height:1.2;letter-spacing:-.02em;margin-bottom:40px;}
.right-headline em{font-style:normal;color:var(--coral-light);}
.benefit-list{display:flex;flex-direction:column;gap:22px;}
.benefit-item{display:flex;align-items:flex-start;gap:14px;}
.benefit-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);}
.benefit-text h4{font-family:'Cal Sans',sans-serif;font-size:15px;font-weight:600;color:white;margin-bottom:2px;}
.benefit-text p{font-size:13px;color:rgba(255,255,255,.6);line-height:1.45;}
.right-tagline{margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);font-family:'Cal Sans','Tajawal',sans-serif;font-size:18px;color:rgba(255,255,255,.5);font-style:italic;}
.right-tagline strong{color:var(--coral-light);font-style:normal;}
button,a{touch-action:manipulation;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;}}
`

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} suppressHydrationWarning/>
      <div className="auth-wrap" dir={dir}>
        <div className="left-panel">
          <div className="top-bar">
            <a className="back-link" href="/">{t.back_home}</a>
            <div className="top-bar-right">
              <div className="logo-row"><Logo s={30}/><span className="logo-name">J2z</span></div>
              <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>{t.lang_toggle}</button>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {mode === 'signup' && (
            <div className="form-area" key="signup">
              <h1 className="form-headline">{t.signup_headline}</h1>
              <p className="form-sub">{t.signup_sub}</p>
              <div className="oauth-stack">
                <button className={`oauth-btn ${loading === 'apple' ? 'loading' : ''}`} onClick={() => handleOAuth('apple')}>
                  {loading === 'apple' ? <><div className="oauth-spin"/>{t.loading_apple}</> : <><AppleIcon/>{t.signup_apple}</>}
                </button>
                <button className={`oauth-btn ${loading === 'google' ? 'loading' : ''}`} onClick={() => handleOAuth('google')}>
                  {loading === 'google' ? <><div className="oauth-spin"/>{t.loading_google}</> : <><GoogleIcon/>{t.signup_google}</>}
                </button>
              </div>
              <div className="divider">{t.or}</div>
              <button className="oauth-btn email-btn" onClick={() => setMode('email-signup')}><EmailIcon/> {t.signup_email}</button>
              <div className="switch-mode">{t.already} <a className="switch-link" onClick={() => setMode('signin')}>{t.signin_link}</a></div>
            </div>
          )}

          {mode === 'signin' && (
            <div className="form-area" key="signin">
              <h1 className="form-headline">{t.signin_headline}</h1>
              <p className="form-sub">{t.signin_sub}</p>
              <div className="oauth-stack">
                <button className={`oauth-btn ${loading === 'apple' ? 'loading' : ''}`} onClick={() => handleOAuth('apple')}>
                  {loading === 'apple' ? <><div className="oauth-spin"/>{t.loading_apple}</> : <><AppleIcon/>{t.signin_apple}</>}
                </button>
                <button className={`oauth-btn ${loading === 'google' ? 'loading' : ''}`} onClick={() => handleOAuth('google')}>
                  {loading === 'google' ? <><div className="oauth-spin"/>{t.loading_google}</> : <><GoogleIcon/>{t.signin_google}</>}
                </button>
              </div>
              <div className="divider">{t.or}</div>
              <button className="oauth-btn email-btn" onClick={() => setMode('email-signin')}><EmailIcon/> {t.signin_email}</button>
              <div className="switch-mode">{t.no_account} <a className="switch-link" onClick={() => setMode('signup')}>{t.signup_link}</a></div>
            </div>
          )}

          {mode === 'email-signup' && (
            <div className="form-area" key="email-signup">
              <button className="back-to-options" onClick={() => setMode('signup')}>
                {lang === 'en' ? '← All sign up options' : '← كل خيارات التسجيل'}
              </button>
              <h1 className="form-headline">{t.email_signup_headline}</h1>
              <div className="field-group">
                <label className="field-label">{t.name_label}</label>
                <input className="field-input" type="text" placeholder={t.name_ph} value={name} onChange={e => setName(e.target.value)} autoFocus/>
              </div>
              <div className="field-group">
                <label className="field-label">{t.email_label}</label>
                <input className="field-input" type="email" placeholder={t.email_ph} value={email} onChange={e => setEmail(e.target.value)} dir="ltr"/>
              </div>
              <div className="field-group">
                <label className="field-label">{t.pass_label}</label>
                <div className="pass-wrap">
                  <input className="field-input" type={showPass ? 'text' : 'password'} placeholder={t.pass_ph} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailSignup()} dir="ltr"/>
                  <button className="pass-eye" onClick={() => setShowPass(!showPass)}><EyeIcon open={showPass}/></button>
                </div>
              </div>
              <button className="submit-btn" onClick={handleEmailSignup} disabled={!email.trim() || !password.trim() || loading === 'email'}>
                {loading === 'email' ? '...' : t.create_btn}
              </button>
              <div className="terms-text">{t.terms} <a href="/terms">{t.terms_link}</a></div>
              <div className="switch-mode">{t.already} <a className="switch-link" onClick={() => setMode('email-signin')}>{t.signin_link}</a></div>
            </div>
          )}

          {mode === 'email-signin' && (
            <div className="form-area" key="email-signin">
              <button className="back-to-options" onClick={() => setMode('signin')}>
                {lang === 'en' ? '← All sign in options' : '← كل خيارات الدخول'}
              </button>
              <h1 className="form-headline">{t.email_signin_headline}</h1>
              <p className="form-sub">{t.email_signin_sub}</p>
              <div className="field-group">
                <label className="field-label">{t.email_label}</label>
                <input className="field-input" type="email" placeholder={t.email_ph} value={email} onChange={e => setEmail(e.target.value)} dir="ltr" autoFocus/>
              </div>
              <div className="field-group">
                <label className="field-label">{t.pass_label}</label>
                <div className="pass-wrap">
                  <input className="field-input" type={showPass ? 'text' : 'password'} placeholder={t.pass_ph} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailSignin()} dir="ltr"/>
                  <button className="pass-eye" onClick={() => setShowPass(!showPass)}><EyeIcon open={showPass}/></button>
                </div>
                <a className="forgot-link">{t.forgot}</a>
              </div>
              <button className="submit-btn" onClick={handleEmailSignin} disabled={!email.trim() || !password.trim() || loading === 'email'}>
                {loading === 'email' ? '...' : t.signin_btn}
              </button>
              <div className="switch-mode">{t.no_account} <a className="switch-link" onClick={() => setMode('email-signup')}>{t.signup_link}</a></div>
            </div>
          )}

          {mode === 'verify' && (
            <div className="form-area verify-wrap" key="verify">
              <div className="verify-icon">📬</div>
              <h1 className="form-headline">{t.verify_headline}</h1>
              <p className="form-sub">{t.verify_sub_1}</p>
              <div className="verify-email-chip">{email}</div>
              <p className="form-sub">{t.verify_sub_2}</p>
              <button className={`resend-btn ${resent ? 'sent' : ''}`} onClick={handleResend}>
                {resent ? t.resent : t.resend}
              </button>
              <a className="change-email-link" onClick={() => { setMode('email-signup'); setEmail('') }}>{t.change_email}</a>
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="right-inner">
            <div className="right-logo">
              <svg viewBox="0 0 60 60" width="42" height="42" fill="none">
                <rect x="0" y="0" width="60" height="60" rx="16" fill="rgba(255,255,255,.12)"/>
                <rect x="28" y="16" width="5" height="20" fill="rgba(255,255,255,.4)"/>
                <rect x="33" y="13" width="5" height="23" fill="rgba(255,255,255,.7)"/>
                <rect x="38" y="10" width="5" height="26" fill="#FFFFFF"/>
                <path d="M43 10 L50 10 L43 18 Z" fill="rgba(255,255,255,.4)"/>
                <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#FFFFFF"/>
              </svg>
              <span className="right-logo-name">J2z</span>
            </div>
            <h2 className="right-headline">
              {lang === 'en' ? <>Everything you need,<br/><em>nothing you don&apos;t.</em></> : <>كل ما تحتاج،<br/><em>بدون زيادة.</em></>}
            </h2>
            <div className="benefit-list">
              {benefits.map((b, i) => (
                <div key={i} className="benefit-item">
                  <div className="benefit-icon">{b.icon}</div>
                  <div className="benefit-text"><h4>{b.title}</h4><p>{b.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="right-tagline">
              {lang === 'en' ? <>Print once. <strong>Update forever.</strong></> : <>اطبعها مرة. <strong>عدّلها للأبد.</strong></>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
