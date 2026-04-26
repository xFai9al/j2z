'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Lang = 'en' | 'ar'

interface StatsData {
  totalUsers: number
  totalLinks: number
  totalQr: number
  totalClicks: number
  topLinks: { id: string; slug: string; destination_url: string; clicks: number; created_at: string }[]
  recentUsers: { id: string; email: string; display_name: string | null; created_at: string }[]
}

interface BlockEntry {
  id: number
  pattern: string
  pattern_type: string
  reason: string | null
  created_at: string
}

const ADMIN_EMAIL = 'faisal@aba-alkhail.com' // lowercase — Supabase normalizes emails

const TXT = {
  en: {
    title: 'Admin Panel', subtitle: 'Platform overview',
    logout: 'Log out',
    total_users: 'Total Users', total_links: 'Short Links', total_qr: 'QR Codes', total_clicks: 'Total Clicks',
    recent: 'Recent Signups', top_links: 'Top Links by Clicks',
    email: 'Email', name: 'Name', joined: 'Joined',
    slug: 'Short URL', destination: 'Destination', clicks: 'Clicks',
    blocklist: 'URL Blocklist', add_pattern: 'Add pattern', pattern_ph: 'domain.com or keyword',
    type_domain: 'Domain', type_keyword: 'Keyword', type_regex: 'Regex',
    add: 'Add', adding: 'Adding...', del: 'Remove',
    no_data: 'No data yet', loading: 'Loading...',
    forbidden: 'Access denied. Admin only.',
  },
  ar: {
    title: 'لوحة الإدارة', subtitle: 'نظرة عامة على المنصة',
    logout: 'خروج',
    total_users: 'المستخدمون', total_links: 'الروابط القصيرة', total_qr: 'أكواد QR', total_clicks: 'إجمالي النقرات',
    recent: 'آخر التسجيلات', top_links: 'أكثر الروابط نقراً',
    email: 'البريد', name: 'الاسم', joined: 'تاريخ الانضمام',
    slug: 'الرابط القصير', destination: 'الوجهة', clicks: 'نقرات',
    blocklist: 'قائمة الحظر', add_pattern: 'إضافة نمط', pattern_ph: 'domain.com أو كلمة مفتاحية',
    type_domain: 'نطاق', type_keyword: 'كلمة', type_regex: 'Regex',
    add: 'إضافة', adding: 'جارٍ...', del: 'حذف',
    no_data: 'لا توجد بيانات بعد', loading: 'جارٍ التحميل...',
    forbidden: 'ممنوع الوصول. للمسؤول فقط.',
  },
}

const Logo = () => (
  <svg viewBox="0 0 60 60" width={30} height={30} fill="none">
    <rect width="60" height="60" rx="16" fill="#FBEDE8"/>
    <rect x="28" y="16" width="5" height="20" fill="#F4A593"/>
    <rect x="33" y="13" width="5" height="23" fill="#E8765C"/>
    <rect x="38" y="10" width="5" height="26" fill="#D45A3F"/>
    <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593"/>
    <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F"/>
  </svg>
)

const IcoUsers = ({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="6" r="3"/><path d="M2 18c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
    <circle cx="15" cy="7" r="2"/><path d="M18 18c0-2.21-1.343-4-3-4"/>
  </svg>
)
const IcoLink = ({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 12.5a4.24 4.24 0 006 0l2.5-2.5a4.24 4.24 0 00-6-6L8.5 5.5"/><path d="M12.5 7.5a4.24 4.24 0 00-6 0L4 10a4.24 4.24 0 006 6l1.5-1.5"/>
  </svg>
)
const IcoQR = ({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 32 32" width={s} height={s} fill="none">
    <rect x="2" y="2" width="10" height="10" rx="2" stroke={c} strokeWidth="2"/>
    <rect x="5" y="5" width="4" height="4" fill={c}/>
    <rect x="20" y="2" width="10" height="10" rx="2" stroke={c} strokeWidth="2"/>
    <rect x="23" y="5" width="4" height="4" fill={c}/>
    <rect x="2" y="20" width="10" height="10" rx="2" stroke={c} strokeWidth="2"/>
    <rect x="5" y="23" width="4" height="4" fill={c}/>
    <rect x="17" y="17" width="2" height="2" fill={c}/>
    <rect x="14" y="14" width="2" height="2" fill={c}/>
  </svg>
)
const IcoCursor = ({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill={c}>
    <path d="M4 2.5l11 7-6.5.5-2.5 6.5L4 2.5z"/>
  </svg>
)
const IcoShield = ({ s = 16, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2L3 5v5c0 4.418 3.134 8.556 7 9.9C13.866 18.556 17 14.418 17 10V5L10 2z"/>
  </svg>
)
const IcoLogout = ({ s = 15, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3"/><path d="M13 14l4-4-4-4M17 10H8"/>
  </svg>
)
const IcoTrash = ({ s = 13, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h14M8 6V4h4v2M5 6l1 11h8l1-11"/>
  </svg>
)

export default function AdminPage() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  const [lang, setLang] = useState<Lang>('en')
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [blocklist, setBlocklist] = useState<BlockEntry[]>([])
  const [blocklistLoaded, setBlocklistLoaded] = useState(false)
  const [newPattern, setNewPattern] = useState('')
  const [newType, setNewType] = useState<'domain' | 'keyword' | 'regex'>('domain')
  const [adding, setAdding] = useState(false)

  const t = TXT[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    getSupabase().auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
        setForbidden(true)
        setLoading(false)
        return
      }
      const [statsRes, blRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/blocklist'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (blRes.ok) {
        const d = await blRes.json()
        setBlocklist(d.blocklist ?? [])
        setBlocklistLoaded(true)
      }
      setLoading(false)
    })
  }, [])

  const addBlock = async () => {
    if (!newPattern.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/blocklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: newPattern.trim(), pattern_type: newType }),
    })
    if (res.ok) {
      const d = await res.json()
      setBlocklist(p => [d.entry, ...p])
      setNewPattern('')
    }
    setAdding(false)
  }

  const removeBlock = async (id: number) => {
    setBlocklist(p => p.filter(x => x.id !== id))
    await fetch(`/api/admin/blocklist?id=${id}`, { method: 'DELETE' })
  }

  const handleLogout = async () => {
    await getSupabase().auth.signOut()
    router.replace('/auth')
  }

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Space Grotesk', 'Tajawal', sans-serif; -webkit-font-smoothing: antialiased; background: #FBFAF7; color: #2F2A24; }
.adm-wrap { min-height: 100vh; background: #FBFAF7; }
.adm-top { background: #2F2A24; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
.adm-top-left { display: flex; align-items: center; gap: 10px; }
.adm-wordmark { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -0.04em; color: #FBFAF7; }
.adm-badge { background: #D45A3F; color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 100px; text-transform: uppercase; letter-spacing: .5px; }
.adm-top-right { display: flex; align-items: center; gap: 8px; }
.adm-lang { height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.15); background: transparent; color: rgba(255,255,255,.7); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; touch-action: manipulation; }
.adm-lang:hover { border-color: rgba(255,255,255,.4); color: white; }
.adm-logout { display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1); background: transparent; color: rgba(255,255,255,.5); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; touch-action: manipulation; }
.adm-logout:hover { color: #F4A593; border-color: rgba(244,165,147,.3); }
.adm-main { max-width: 1100px; margin: 0 auto; padding: 28px 22px 60px; }
.adm-head { margin-bottom: 24px; }
.adm-title { font-family: 'Cal Sans', 'Tajawal', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: #2F2A24; margin-bottom: 3px; }
.adm-sub { font-size: 13.5px; color: #6B6257; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
@media (max-width: 800px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 420px) { .stat-grid { grid-template-columns: 1fr; } }
.stat-card { background: #FFFFFF; border: 1px solid #E8E2D6; border-radius: 14px; padding: 16px 18px; position: relative; overflow: hidden; transition: box-shadow .2s; }
.stat-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,.07); }
.stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:14px 14px 0 0; }
.sc-coral::before { background: linear-gradient(90deg, #D45A3F, #F4A593); }
.sc-sage::before { background: linear-gradient(90deg, #8FA68E, #C2D4C1); }
.sc-butter::before { background: linear-gradient(90deg, #E8C66B, #F5E0A0); }
.sc-warm::before { background: linear-gradient(90deg, #A89F92, #D4CFC8); }
.stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.stat-lbl { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #A89F92; }
.stat-ico { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.ico-coral { background: #FBEDE8; } .ico-sage { background: #EDF1EC; } .ico-butter { background: #FAF3DC; } .ico-warm { background: #F5F2EC; }
.stat-num { font-family: 'Cal Sans', 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.03em; line-height: 1; color: #2F2A24; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
@media (max-width: 700px) { .grid2 { grid-template-columns: 1fr; } }
.card { background: #FFFFFF; border: 1px solid #E8E2D6; border-radius: 16px; padding: 18px; margin-bottom: 20px; }
.card-hd { font-family: 'Cal Sans', sans-serif; font-size: 14px; font-weight: 700; color: #2F2A24; margin-bottom: 14px; }
.adm-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.adm-table th { text-align: left; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #A89F92; padding: 0 8px 10px; border-bottom: 1px solid #E8E2D6; }
[dir=rtl] .adm-table th, [dir=rtl] .adm-table td { text-align: right; }
.adm-table td { padding: 9px 8px; border-bottom: 1px solid #F5F2EC; color: #2F2A24; vertical-align: middle; }
.adm-table tr:last-child td { border-bottom: none; }
.adm-table tr:hover td { background: #FBFAF7; }
.td-email { color: #6B6257; font-size: 11.5px; direction: ltr; }
.td-name { font-weight: 600; }
.td-date { color: #A89F92; font-size: 11px; white-space: nowrap; direction: ltr; }
.td-slug { font-family: monospace; font-weight: 700; color: #D45A3F; direction: ltr; }
.td-dest { color: #A89F92; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; direction: ltr; }
.td-clicks { font-weight: 700; color: #2F2A24; text-align: center; }
.td-type { display: inline-flex; align-items: center; gap: 3px; background: #F5F2EC; border-radius: 4px; padding: 1px 6px; font-size: 10px; font-weight: 600; color: #6B6257; text-transform: uppercase; }
.block-add-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.bl-input { flex: 1; min-width: 160px; padding: 9px 12px; background: #FBFAF7; border: 1.5px solid #E8E2D6; border-radius: 10px; font-size: 13px; color: #2F2A24; font-family: inherit; outline: none; transition: border-color .15s; direction: ltr; }
.bl-input:focus { border-color: #D45A3F; box-shadow: 0 0 0 3px #FBEDE8; }
.bl-select { padding: 9px 12px; background: #FBFAF7; border: 1.5px solid #E8E2D6; border-radius: 10px; font-size: 13px; color: #2F2A24; font-family: inherit; outline: none; cursor: pointer; }
.bl-add { padding: 9px 18px; background: #E8765C; color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; white-space: nowrap; touch-action: manipulation; }
.bl-add:hover { background: #D45A3F; transform: translateY(-1px); }
.bl-add:disabled { background: #A89F92; cursor: not-allowed; transform: none; }
.bl-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #FBFAF7; border: 1px solid #E8E2D6; margin-bottom: 7px; }
.bl-pattern { font-family: monospace; font-size: 13px; font-weight: 600; color: #2F2A24; flex: 1; direction: ltr; }
.bl-del { padding: 4px 10px; border-radius: 6px; border: 1px solid #E8E2D6; background: white; color: #A89F92; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 4px; transition: all .15s; touch-action: manipulation; }
.bl-del:hover { border-color: #E05252; color: #E05252; background: #FDEAEA; }
.skel-wrap { display: flex; min-height: 100vh; align-items: center; justify-content: center; background: #FBFAF7; flex-direction: column; gap: 14px; }
.skel-logo { animation: skelPulse 1.4s ease-in-out infinite; }
@keyframes skelPulse { 0%,100%{opacity:.4} 50%{opacity:1} }
.skel-bar { height: 8px; border-radius: 4px; background: #E8E2D6; animation: skelPulse 1.4s ease-in-out infinite; }
.forbidden-wrap { display: flex; min-height: 100vh; align-items: center; justify-content: center; background: #FBFAF7; flex-direction: column; gap: 12px; text-align: center; padding: 20px; }
.forbidden-ico { font-size: 40px; }
.forbidden-msg { font-size: 16px; font-weight: 600; color: #6B6257; }
.forbidden-link { color: #D45A3F; font-size: 13px; text-decoration: none; font-weight: 600; }
.forbidden-link:hover { text-decoration: underline; }
.no-data { text-align: center; padding: 24px; font-size: 13px; color: #A89F92; }
`

  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} suppressHydrationWarning />
      <div className="skel-wrap">
        <div className="skel-logo">
          <svg viewBox="0 0 60 60" width={40} height={40} fill="none">
            <rect width="60" height="60" rx="16" fill="#FBEDE8"/>
            <rect x="28" y="16" width="5" height="20" fill="#F4A593"/>
            <rect x="33" y="13" width="5" height="23" fill="#E8765C"/>
            <rect x="38" y="10" width="5" height="26" fill="#D45A3F"/>
            <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593"/>
            <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F"/>
          </svg>
        </div>
        <div className="skel-bar" style={{ width: 120, animationDelay: '.1s' }} />
        <div className="skel-bar" style={{ width: 80, animationDelay: '.2s' }} />
      </div>
    </>
  )

  if (forbidden) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} suppressHydrationWarning />
      <div className="forbidden-wrap">
        <IcoShield s={42} c="#D45A3F" />
        <p className="forbidden-msg">{t.forbidden}</p>
        <a className="forbidden-link" href="/">&larr; Back to home</a>
      </div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} suppressHydrationWarning />
      <div className="adm-wrap" dir={dir}>

        <header className="adm-top">
          <div className="adm-top-left">
            <Logo />
            <span className="adm-wordmark">J2z</span>
            <span className="adm-badge">{t.title}</span>
          </div>
          <div className="adm-top-right">
            <button className="adm-lang" onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}>
              {lang === 'en' ? 'العربية' : 'EN'}
            </button>
            <button className="adm-logout" onClick={handleLogout}>
              <IcoLogout s={13} c="currentColor" />
              {t.logout}
            </button>
          </div>
        </header>

        <main className="adm-main">
          <div className="adm-head">
            <h1 className="adm-title">{t.title}</h1>
            <p className="adm-sub">{t.subtitle}</p>
          </div>

          {/* Stat cards */}
          <div className="stat-grid">
            {[
              { lbl: t.total_users,  val: stats?.totalUsers  ?? 0, ico: <IcoUsers  s={15} c="#3E5F3C"/>, bg: 'ico-sage',   acc: 'sc-sage' },
              { lbl: t.total_links,  val: stats?.totalLinks  ?? 0, ico: <IcoLink   s={15} c="#D45A3F"/>, bg: 'ico-coral',  acc: 'sc-coral' },
              { lbl: t.total_qr,     val: stats?.totalQr     ?? 0, ico: <IcoQR     s={15} c="#A07B1A"/>, bg: 'ico-butter', acc: 'sc-butter' },
              { lbl: t.total_clicks, val: stats?.totalClicks ?? 0, ico: <IcoCursor s={15} c="#6B6257"/>, bg: 'ico-warm',   acc: 'sc-warm' },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.acc}`}>
                <div className="stat-top">
                  <span className="stat-lbl">{s.lbl}</span>
                  <div className={`stat-ico ${s.bg}`} aria-hidden="true">{s.ico}</div>
                </div>
                <div className="stat-num">{s.val.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Recent signups + Top links */}
          <div className="grid2">
            <div className="card">
              <div className="card-hd">{t.recent}</div>
              {!stats || stats.recentUsers.length === 0
                ? <div className="no-data">{t.no_data}</div>
                : <table className="adm-table">
                  <thead>
                    <tr>
                      <th>{t.name}</th>
                      <th>{t.email}</th>
                      <th>{t.joined}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map(u => (
                      <tr key={u.id}>
                        <td className="td-name">{u.display_name || '—'}</td>
                        <td className="td-email">{u.email}</td>
                        <td className="td-date">{u.created_at?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>

            <div className="card">
              <div className="card-hd">{t.top_links}</div>
              {!stats || stats.topLinks.length === 0
                ? <div className="no-data">{t.no_data}</div>
                : <table className="adm-table">
                  <thead>
                    <tr>
                      <th>{t.slug}</th>
                      <th>{t.destination}</th>
                      <th style={{ textAlign: 'center' }}>{t.clicks}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topLinks.map(l => (
                      <tr key={l.id}>
                        <td className="td-slug">/{l.slug}</td>
                        <td className="td-dest" title={l.destination_url}>{l.destination_url}</td>
                        <td className="td-clicks">{l.clicks.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          </div>

          {/* URL Blocklist */}
          <div className="card">
            <div className="card-hd"><IcoShield s={14} c="#D45A3F" /> {t.blocklist}</div>
            <div className="block-add-row">
              <input
                className="bl-input"
                placeholder={t.pattern_ph}
                value={newPattern}
                onChange={e => setNewPattern(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBlock()}
              />
              <select className="bl-select" value={newType} onChange={e => setNewType(e.target.value as 'domain' | 'keyword' | 'regex')}>
                <option value="domain">{t.type_domain}</option>
                <option value="keyword">{t.type_keyword}</option>
                <option value="regex">{t.type_regex}</option>
              </select>
              <button className="bl-add" onClick={addBlock} disabled={!newPattern.trim() || adding}>
                {adding ? t.adding : t.add}
              </button>
            </div>
            {!blocklistLoaded
              ? <div className="no-data">{t.loading}</div>
              : blocklist.length === 0
                ? <div className="no-data">{t.no_data}</div>
                : blocklist.map(b => (
                  <div key={b.id} className="bl-row">
                    <span className="bl-pattern">{b.pattern}</span>
                    <span className="td-type">{b.pattern_type}</span>
                    <span className="td-date">{b.created_at?.slice(0, 10)}</span>
                    <button className="bl-del" onClick={() => removeBlock(b.id)}>
                      <IcoTrash s={12} c="currentColor" /> {t.del}
                    </button>
                  </div>
                ))
            }
          </div>
        </main>
      </div>
    </>
  )
}
