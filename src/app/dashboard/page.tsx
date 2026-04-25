'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import QRCode from 'qrcode'

type Lang = 'en' | 'ar'
type TabKey = 'overview' | 'links' | 'qr' | 'bio' | 'analytics' | 'settings'

interface LinkItem {
  id: string
  slug: string
  url: string
  clicks: number
  created: string
}
interface QrItem {
  id: string
  slug: string
  url: string
  scans: number
  created: string
}
interface BioPage { id: string; username: string; display_name: string | null; bio: string | null; is_published: boolean }
interface BioLink { id: string; title: string; url: string; sort_order: number }
const WEEKLY = [12, 28, 19, 44, 36, 62, 48]
const DAYS = { en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], ar: ['إث','ثلا','أرب','خمي','جمع','سبت','أحد'] }
const COUNTRIES = [
  { code:'SA', en:'Saudi Arabia', ar:'السعودية', pct:44, flag:'🇸🇦' },
  { code:'AE', en:'UAE', ar:'الإمارات', pct:28, flag:'🇦🇪' },
  { code:'KW', en:'Kuwait', ar:'الكويت', pct:14, flag:'🇰🇼' },
  { code:'EG', en:'Egypt', ar:'مصر', pct:8, flag:'🇪🇬' },
  { code:'OT', en:'Other', ar:'أخرى', pct:6, flag:'🌍' },
]
const DEVICES = [
  { en:'Mobile', ar:'موبايل', pct:72, color:'#E8765C' },
  { en:'Desktop', ar:'حاسوب', pct:22, color:'#8FA68E' },
  { en:'Tablet', ar:'تابلت', pct:6, color:'#E8C66B' },
]

const Logo = ({ s = 32 }: { s?: number }) => (
  <svg viewBox="0 0 60 60" width={s} height={s} fill="none">
    <rect width="60" height="60" rx="16" fill="#FBEDE8"/>
    <rect x="28" y="16" width="5" height="20" fill="#F4A593"/>
    <rect x="33" y="13" width="5" height="23" fill="#E8765C"/>
    <rect x="38" y="10" width="5" height="26" fill="#D45A3F"/>
    <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593"/>
    <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F"/>
  </svg>
)

const QRIcon = ({ s = 18, color = '#D45A3F' }: { s?: number; color?: string }) => (
  <svg viewBox="0 0 32 32" width={s} height={s} fill="none">
    <rect x="2" y="2" width="10" height="10" rx="2" stroke={color} strokeWidth="2"/>
    <rect x="5" y="5" width="4" height="4" fill={color}/>
    <rect x="20" y="2" width="10" height="10" rx="2" stroke={color} strokeWidth="2"/>
    <rect x="23" y="5" width="4" height="4" fill={color}/>
    <rect x="2" y="20" width="10" height="10" rx="2" stroke={color} strokeWidth="2"/>
    <rect x="5" y="23" width="4" height="4" fill={color}/>
    <rect x="14" y="4" width="2" height="2" fill={color}/>
    <rect x="14" y="14" width="2" height="2" fill={color}/>
    <rect x="17" y="17" width="2" height="2" fill={color}/>
    <rect x="20" y="14" width="2" height="2" fill={color}/>
    <rect x="14" y="20" width="2" height="2" fill={color}/>
    <rect x="20" y="26" width="2" height="2" fill={color}/>
  </svg>
)
const IcoGrid = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5"/>
    <rect x="2" y="11" width="7" height="7" rx="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5"/>
  </svg>
)
const IcoLink = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 12.5a4.24 4.24 0 006 0l2.5-2.5a4.24 4.24 0 00-6-6L8.5 5.5"/><path d="M12.5 7.5a4.24 4.24 0 00-6 0L4 10a4.24 4.24 0 006 6l1.5-1.5"/>
  </svg>
)
const IcoSparkle = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill={c}>
    <path d="M10 2l1.8 5.4L17.5 9l-5.7 1.6L10 16.5l-1.8-5.9L2.5 9l5.7-1.6L10 2z"/>
  </svg>
)
const IcoChart = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="10" width="3" height="8" rx="1"/><rect x="8.5" y="6" width="3" height="12" rx="1"/><rect x="15" y="2" width="3" height="16" rx="1"/>
  </svg>
)
const IcoCog = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="2.5"/>
    <path d="M10 1v2.5M10 16.5V19M1 10h2.5M16.5 10H19M3.6 3.6l1.8 1.8M14.6 14.6l1.8 1.8M3.6 16.4l1.8-1.8M14.6 5.4l1.8-1.8"/>
  </svg>
)
const IcoSun = ({ s=16, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
    <circle cx="10" cy="10" r="3.5"/>
    <path d="M10 1.5V4M10 16v2.5M1.5 10H4M16 10h2.5M3.7 3.7l1.7 1.7M14.6 14.6l1.7 1.7M3.7 16.3l1.7-1.7M14.6 5.4l1.7-1.7"/>
  </svg>
)
const IcoMoon = ({ s=16, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 11.5A7 7 0 018.5 3.5a7 7 0 100 13 7 7 0 008-5z"/>
  </svg>
)
const IcoCursor = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill={c}>
    <path d="M4 2.5l11 7-6.5.5-2.5 6.5L4 2.5z"/>
  </svg>
)
const IcoRadio = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
    <circle cx="10" cy="10" r="2"/><path d="M5.64 5.64a6 6 0 000 8.48M14.36 5.64a6 6 0 010 8.48M2.93 2.93a10 10 0 000 14.14M17.07 2.93a10 10 0 010 14.14"/>
  </svg>
)
const IcoCalendar = ({ s=13, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="16" height="14" rx="2"/><path d="M2 8h16M6 2v4M14 2v4"/>
  </svg>
)
const IcoDownload = ({ s=13, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3v10M6 9l4 4 4-4"/><path d="M3 17h14"/>
  </svg>
)
const IcoPencil = ({ s=13, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l4-1 9-9a1.41 1.41 0 00-2-2L5 14z"/><path d="M14 5l2 2"/>
  </svg>
)
const IcoWarn = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2L1.5 17h17L10 2z"/><path d="M10 8v4"/><circle cx="10" cy="14.5" r=".5" fill={c}/>
  </svg>
)
const IcoLogout = ({ s=15, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3"/><path d="M13 14l4-4-4-4M17 10H8"/>
  </svg>
)
const IcoMenu = ({ s=16, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
    <path d="M3 5h14M3 10h14M3 15h14"/>
  </svg>
)
const IcoX = ({ s=16, c='currentColor' }: {s?:number;c?:string}) => (
  <svg viewBox="0 0 20 20" width={s} height={s} fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round">
    <path d="M4 4l12 12M16 4L4 16"/>
  </svg>
)

const TXT = {
  en: {
    overview:'Overview', links:'Links', qr:'QR Codes', bio:'Bio Link', analytics:'Analytics', settings:'Settings', logout:'Log out',
    good_morning:'Good morning', good_evening:'Good evening',
    overview_sub:'Here\'s how your links are performing today.',
    total_clicks:'Total Clicks', total_links:'Short Links', total_qr:'QR Codes', total_scans:'QR Scans',
    vs_last:'vs last week', this_week:'This week',
    weekly:'Weekly Activity', countries:'Top Countries', devices:'Devices', recent:'Recent Links', view_all:'View all →',
    new_link:'+ New Link', new_qr:'+ New QR',
    copy:'Copy', copied:'✓', edit:'Edit', del:'Delete',
    clicks:'clicks', scans:'scans', last_click:'Last click',
    url_ph:'Paste a URL to shorten...', custom_ph:'custom path', shorten:'Shorten',
    qr_ph:'Paste a URL for QR code...', generate:'Generate',
    download:'Download', edit_dest:'Edit destination',
    bio_title:'Your Bio Page', bio_live:'Live at', bio_edit:'Edit page',
    bio_views:'Total views', bio_links:'Links on page',
    s_name:'Display name', s_email:'Email', s_lang:'Language',
    s_save:'Save changes', s_saved:'✓ Saved!', s_danger:'Danger zone',
    s_delete:'Delete account',
    empty_links:'No links yet. Create one above ↑',
    empty_qr:'No QR codes yet. Create one above ↑',
    new_dest:'New destination URL',
    save:'Save',
    bio_create_title:'Create your bio page',
    bio_create_sub:'Choose a username to get your public page at j2z.com/username',
    bio_username:'Username', bio_username_hint:'3–30 chars: letters, numbers, _ or -',
    bio_display_name:'Display name', bio_tagline:'Tagline',
    bio_create_btn:'Create page', bio_creating:'Creating...',
    bio_profile:'Profile', bio_your_links:'Your links',
    bio_save_profile:'Save profile', bio_saving:'Saving...',
    bio_published:'Published', bio_unpublished:'Unpublished',
    bio_add_link:'+ Add Link', bio_link_title:'Link title', bio_link_url:'URL (https://...)',
    bio_no_links:'No links yet. Add one below.',
    bio_view:'View page', bio_error:'',
  },
  ar: {
    overview:'نظرة عامة', links:'الروابط', qr:'أكواد QR', bio:'بايو لينك', analytics:'التحليلات', settings:'الإعدادات', logout:'خروج',
    good_morning:'صباح الخير', good_evening:'مساء الخير',
    overview_sub:'ملخص أداء روابطك اليوم.',
    total_clicks:'إجمالي النقرات', total_links:'الروابط القصيرة', total_qr:'أكواد QR', total_scans:'مسحات QR',
    vs_last:'مقارنة بالأسبوع الماضي', this_week:'هذا الأسبوع',
    weekly:'النشاط الأسبوعي', countries:'أهم الدول', devices:'الأجهزة', recent:'آخر الروابط', view_all:'عرض الكل →',
    new_link:'+ رابط جديد', new_qr:'+ QR جديد',
    copy:'نسخ', copied:'✓', edit:'تعديل', del:'حذف',
    clicks:'نقرة', scans:'مسح', last_click:'آخر نقرة',
    url_ph:'الصق رابطاً للتقصير...', custom_ph:'مسار مخصص', shorten:'اختصر',
    qr_ph:'الصق رابطاً لعمل QR...', generate:'توليد',
    download:'تحميل', edit_dest:'تعديل الوجهة',
    bio_title:'صفحتك الشخصية', bio_live:'متاحة على', bio_edit:'تعديل الصفحة',
    bio_views:'إجمالي المشاهدات', bio_links:'الروابط في الصفحة',
    s_name:'الاسم', s_email:'البريد الإلكتروني', s_lang:'اللغة',
    s_save:'حفظ التغييرات', s_saved:'✓ تم الحفظ!', s_danger:'منطقة الخطر',
    s_delete:'حذف الحساب',
    empty_links:'لا توجد روابط بعد. أنشئ واحدة أعلاه ↑',
    empty_qr:'لا توجد أكواد QR بعد. أنشئ واحداً أعلاه ↑',
    new_dest:'رابط الوجهة الجديد',
    save:'حفظ',
    bio_create_title:'أنشئ صفحتك الشخصية',
    bio_create_sub:'اختر اسم مستخدم للحصول على صفحتك على j2z.com/username',
    bio_username:'اسم المستخدم', bio_username_hint:'3–30 حرفاً: حروف وأرقام و _ أو -',
    bio_display_name:'الاسم الظاهر', bio_tagline:'النبذة',
    bio_create_btn:'إنشاء الصفحة', bio_creating:'جارٍ الإنشاء...',
    bio_profile:'الملف الشخصي', bio_your_links:'روابطك',
    bio_save_profile:'حفظ الملف', bio_saving:'جارٍ الحفظ...',
    bio_published:'منشور', bio_unpublished:'غير منشور',
    bio_add_link:'+ إضافة رابط', bio_link_title:'عنوان الرابط', bio_link_url:'رابط (https://...)',
    bio_no_links:'لا توجد روابط بعد. أضف رابطاً أدناه.',
    bio_view:'عرض الصفحة', bio_error:'',
  }
}

export default function Dashboard() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient()
    return supabaseRef.current
  }

  const [user, setUser] = useState<User | null>(null)
  const [lang, setLang] = useState<Lang>('en')
  const [dark, setDark] = useState(false)
  const [tab, setTab] = useState<TabKey>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [qrs, setQrs] = useState<QrItem[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editQrId, setEditQrId] = useState<string | null>(null)
  const [editDest, setEditDest] = useState('')
  const [saved, setSaved] = useState(false)
  const [bioPage, setBioPage] = useState<BioPage | null>(null)
  const [bioLinks, setBioLinks] = useState<BioLink[]>([])
  const [bioLoaded, setBioLoaded] = useState(false)
  const [bioForm, setBioForm] = useState({ username: '', display_name: '', bio: '' })
  const [bioSaving, setBioSaving] = useState(false)
  const [bioSaved, setBioSaved] = useState(false)
  const [bioCreating, setBioCreating] = useState(false)
  const [bioError, setBioError] = useState('')
  const [newBioTitle, setNewBioTitle] = useState('')
  const [newBioUrl, setNewBioUrl] = useState('')
  const [editBioLinkId, setEditBioLinkId] = useState<string | null>(null)
  const [editBioLinkTitle, setEditBioLinkTitle] = useState('')
  const [editBioLinkUrl, setEditBioLinkUrl] = useState('')
  const qrRefs = useRef<Record<string, HTMLCanvasElement | null>>({})
  const t = TXT[lang]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const hr = new Date().getHours()
  const greeting = hr < 14 ? t.good_morning : t.good_evening

  const fetchLinks = useCallback(async (uid: string) => {
    const sb = getSupabase()
    const { data } = await sb.from('links').select('id,slug,destination_url,clicks,created_at').eq('user_id', uid).eq('is_active', true).order('created_at', { ascending: false })
    if (data) setLinks(data.map(l => ({ id: l.id, slug: l.slug, url: l.destination_url, clicks: l.clicks ?? 0, created: l.created_at?.slice(0, 10) ?? '' })))
  }, [])

  const fetchQrs = useCallback(async (uid: string) => {
    const sb = getSupabase()
    const { data } = await sb.from('qr_codes').select('id,slug,destination_url,scans,created_at').eq('user_id', uid).eq('is_active', true).order('created_at', { ascending: false })
    if (data) setQrs(data.map(q => ({ id: q.id, slug: q.slug, url: q.destination_url, scans: q.scans ?? 0, created: q.created_at?.slice(0, 10) ?? '' })))
  }, [])

  const fetchBio = useCallback(async () => {
    const res = await fetch('/api/bio')
    const data = await res.json()
    if (data.page) {
      setBioPage({ id: data.page.id, username: data.page.username, display_name: data.page.display_name, bio: data.page.bio, is_published: data.page.is_published })
      setBioLinks(((data.page.bio_links ?? []) as (BioLink & { is_active: boolean })[]).filter(l => l.is_active).sort((a, b) => a.sort_order - b.sort_order))
      setBioForm({ username: data.page.username, display_name: data.page.display_name ?? '', bio: data.page.bio ?? '' })
    }
    setBioLoaded(true)
  }, [])

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth')
      } else {
        setUser(data.user)
        fetchLinks(data.user.id)
        fetchQrs(data.user.id)
      }
    })
  }, [])

  const drawQR = useCallback(async (canvas: HTMLCanvasElement, url: string) => {
    if (!canvas) return
    try {
      await QRCode.toCanvas(canvas, url || 'https://j2z.com', {
        width: 120,
        color: { dark: '#2F2A24', light: '#FFFFFF' },
        margin: 1,
      })
    } catch {}
  }, [])

  useEffect(() => {
    if (tab === 'qr') {
      setTimeout(() => {
        qrs.forEach(q => {
          const el = qrRefs.current[q.id]
          if (el) drawQR(el, q.url)
        })
      }, 50)
    }
    if (tab === 'bio' && !bioLoaded) fetchBio()
  }, [tab, qrs, drawQR, bioLoaded, fetchBio])

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`j2z.com/${slug}`).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const addLink = async () => {
    const u = newUrl.trim()
    if (!u) return
    const slug = newSlug.trim() || Math.random().toString(36).slice(2, 6)
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u, slug }),
      })
      const data = await res.json()
      if (res.ok) {
        setLinks(p => [{ id: data.id ?? String(Date.now()), slug: data.slug ?? slug, url: u, clicks: 0, created: new Date().toISOString().slice(0, 10) }, ...p])
        setNewUrl('')
        setNewSlug('')
      }
    } catch {
      setLinks(p => [{ id: String(Date.now()), slug, url: u, clicks: 0, created: new Date().toISOString().slice(0, 10) }, ...p])
      setNewUrl('')
      setNewSlug('')
    }
  }

  const addQR = async () => {
    const u = qrUrl.trim()
    if (!u) return
    setQrUrl('')
    try {
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u }),
      })
      const data = await res.json()
      if (res.ok) {
        const q: QrItem = { id: data.id, slug: data.slug, url: u, scans: 0, created: new Date().toISOString().slice(0, 10) }
        setQrs(p => [q, ...p])
        setTimeout(() => {
          const el = qrRefs.current[q.id]
          if (el) drawQR(el, u)
        }, 80)
      }
    } catch {}
  }

  const deleteLink = async (id: string) => {
    setLinks(p => p.filter(x => x.id !== id))
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
  }

  const deleteQr = async (id: string) => {
    setQrs(p => p.filter(x => x.id !== id))
    await fetch(`/api/qr/${id}`, { method: 'DELETE' })
  }

  const saveQrDest = async (id: string) => {
    setQrs(p => p.map(q => q.id === id ? { ...q, url: editDest } : q))
    setEditQrId(null)
    const dest = editDest
    setEditDest('')
    await fetch(`/api/qr/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_url: dest }),
    })
  }

  const downloadQR = (id: string, slug: string) => {
    const cvs = qrRefs.current[id]
    if (!cvs) return
    const a = document.createElement('a')
    a.href = cvs.toDataURL()
    a.download = `j2z-${slug}.png`
    a.click()
  }

  const handleLogout = async () => {
    await getSupabase().auth.signOut()
    router.replace('/auth')
  }

  const createBioPage = async () => {
    const { username, display_name, bio } = bioForm
    if (!username.trim()) return
    setBioCreating(true)
    setBioError('')
    const res = await fetch('/api/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), display_name: display_name.trim() || null, bio: bio.trim() || null }),
    })
    const data = await res.json()
    if (res.ok) {
      setBioPage(data.page)
      setBioLinks([])
    } else {
      setBioError(data.error ?? 'Error creating page')
    }
    setBioCreating(false)
  }

  const saveBioProfile = async () => {
    if (!bioPage) return
    setBioSaving(true)
    const res = await fetch('/api/bio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: bioForm.display_name.trim() || null, bio: bioForm.bio.trim() || null }),
    })
    if (res.ok) {
      const data = await res.json()
      setBioPage(p => p ? { ...p, display_name: data.page.display_name, bio: data.page.bio } : p)
      setBioSaved(true)
      setTimeout(() => setBioSaved(false), 2000)
    }
    setBioSaving(false)
  }

  const toggleBioPublish = async () => {
    if (!bioPage) return
    const newVal = !bioPage.is_published
    setBioPage(p => p ? { ...p, is_published: newVal } : p)
    await fetch('/api/bio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: newVal }),
    })
  }

  const addBioLink = async () => {
    const title = newBioTitle.trim()
    const url = newBioUrl.trim()
    if (!title || !url) return
    const res = await fetch('/api/bio/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url }),
    })
    if (res.ok) {
      const data = await res.json()
      setBioLinks(p => [...p, data.link])
      setNewBioTitle('')
      setNewBioUrl('')
    }
  }

  const deleteBioLink = async (id: string) => {
    setBioLinks(p => p.filter(l => l.id !== id))
    await fetch(`/api/bio/links/${id}`, { method: 'DELETE' })
  }

  const saveBioLink = async (id: string) => {
    setBioLinks(p => p.map(l => l.id === id ? { ...l, title: editBioLinkTitle, url: editBioLinkUrl } : l))
    setEditBioLinkId(null)
    await fetch(`/api/bio/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editBioLinkTitle, url: editBioLinkUrl }),
    })
  }

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0)
  const totalScans = qrs.reduce((s, q) => s + q.scans, 0)
  const maxBar = Math.max(...WEEKLY)
  const weekTotal = WEEKLY.reduce((a, b) => a + b, 0)

  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? '...'
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?'

  const TABS = [
    { key: 'overview' as TabKey, icon: 'grid', label_en: 'Overview', label_ar: 'نظرة عامة' },
    { key: 'links' as TabKey, icon: 'link', label_en: 'Links', label_ar: 'الروابط' },
    { key: 'qr' as TabKey, icon: 'qr', label_en: 'QR Codes', label_ar: 'QR' },
    { key: 'bio' as TabKey, icon: 'sparkle', label_en: 'Bio Link', label_ar: 'البايو' },
    { key: 'analytics' as TabKey, icon: 'chart', label_en: 'Analytics', label_ar: 'التحليلات' },
    { key: 'settings' as TabKey, icon: 'cog', label_en: 'Settings', label_ar: 'الإعدادات' },
  ]

  const theme: Record<string, string> = dark ? {
    '--bg': '#1A1714', '--surface': '#242018', '--surface2': '#2E291F',
    '--border': '#3A342A', '--border2': '#4A4238', '--ink': '#F0EBE0',
    '--ink2': '#B0A898', '--ink3': '#706860', '--sidebar': '#141210',
    '--topbar': '#1E1B16', '--hover': '#302B20', '--tag-bg': '#FBEDE820',
  } : {
    '--bg': '#FBFAF7', '--surface': '#FFFFFF', '--surface2': '#F5F2EC',
    '--border': '#E8E2D6', '--border2': '#DDD7CA', '--ink': '#2F2A24',
    '--ink2': '#6B6257', '--ink3': '#A89F92', '--sidebar': '#2F2A24',
    '--topbar': '#FFFFFF', '--hover': '#FFF4F1', '--tag-bg': '#FBEDE8',
  }

  const css = `
@import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Space Grotesk', 'Tajawal', sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.5; min-height: 100vh; }
.wrap { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); color: var(--ink); transition: background .25s, color .25s; }
.topbar { background: var(--topbar); border-bottom: 1px solid var(--border); padding: 0 20px; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 300; flex-shrink: 0; gap: 12px; transition: background .25s, border-color .25s; }
.topbar-left { display: flex; align-items: center; gap: 10px; }
.hamburger { display: none; background: none; border: 1px solid var(--border); border-radius: 8px; width: 36px; height: 36px; align-items: center; justify-content: center; cursor: pointer; color: var(--ink); font-size: 16px; transition: all .15s; flex-shrink: 0; touch-action: manipulation; }
.hamburger:hover { background: var(--hover); }
@media (max-width: 768px) { .hamburger { display: flex; } }
.logo-row { display: flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none; }
.logo-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.04em; color: var(--ink); }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.icon-btn { width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface2); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--ink); transition: all .15s; flex-shrink: 0; touch-action: manipulation; }
.icon-btn:hover { background: var(--hover); border-color: #D45A3F; }
.lang-btn { height: 36px; padding: 0 12px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface2); cursor: pointer; font-size: 12px; font-weight: 600; color: var(--ink); font-family: inherit; transition: all .15s; touch-action: manipulation; }
.lang-btn:hover { background: var(--hover); border-color: #D45A3F; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #E8765C 0%, #E8C66B 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; cursor: pointer; flex-shrink: 0; }
.body-row { display: flex; flex: 1; min-height: 0; }
.sidebar { width: 220px; flex-shrink: 0; background: var(--sidebar); display: flex; flex-direction: column; padding: 16px 10px; height: calc(100vh - 56px); position: sticky; top: 56px; overflow-y: auto; transition: background .25s; }
@media (max-width: 768px) { .sidebar { position: fixed; top: 0; bottom: 0; left: -260px; width: 240px; z-index: 400; height: 100vh; padding-top: 20px; transition: left .25s ease, background .25s; } .sidebar.open { left: 0; } [dir="rtl"] .sidebar { left: auto; right: -260px; } [dir="rtl"] .sidebar.open { right: 0; } }
.nav-list { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: none; background: transparent; color: rgba(255,255,255,0.55); font-size: 13.5px; font-weight: 500; cursor: pointer; font-family: inherit; width: 100%; text-align: left; transition: all .15s; touch-action: manipulation; }
[dir="rtl"] .nav-btn { text-align: right; }
.nav-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.9); }
.nav-btn.active { background: #D45A3F; color: white; box-shadow: 0 3px 10px rgba(212,90,63,0.35); }
.nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.nav-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 10px 0; }
.nav-bottom { margin-top: auto; }
.logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: none; background: transparent; color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; width: 100%; text-align: left; transition: color .15s; touch-action: manipulation; }
[dir="rtl"] .logout-btn { text-align: right; }
.logout-btn:hover { color: #F4A593; }
.overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 350; cursor: pointer; }
.overlay.show { display: block; }
.main { flex: 1; padding: 24px 22px; overflow-y: auto; min-width: 0; animation: fadeUp .22s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
.pg-head { margin-bottom: 22px; }
.pg-title { font-family: 'Cal Sans', 'Tajawal', sans-serif; font-size: clamp(20px, 3vw, 28px); font-weight: 700; letter-spacing: -0.02em; margin-bottom: 3px; color: var(--ink); }
.pg-sub { font-size: 14px; color: var(--ink2); }
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; transition: all .2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.stat-lbl { font-size: 11px; color: var(--ink3); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.stat-ico { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.bg-coral { background: #FBEDE8; } .bg-sage { background: #EDF1EC; } .bg-butter { background: #FAF3DC; } .bg-warm { background: var(--surface2); }
.stat-num { font-family: 'Cal Sans', 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; margin-bottom: 4px; }
.c-coral { color: #D45A3F; } .c-sage { color: #8FA68E; } .c-butter { color: #A07B1A; }
.stat-delta { font-size: 11px; color: var(--ink3); }
.stat-delta b { color: #2D9B6A; }
.grid2 { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; margin-bottom: 20px; }
@media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; transition: background .25s, border-color .25s; }
.card-hd { font-family: 'Cal Sans', sans-serif; font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
.card-act { font-size: 12px; color: #D45A3F; font-weight: 600; cursor: pointer; font-family: 'Space Grotesk', sans-serif; }
.card-act:hover { text-decoration: underline; }
.bar-chart { display: flex; align-items: flex-end; gap: 5px; height: 80px; margin-bottom: 8px; }
.bc-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.bc-bar { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; cursor: pointer; transition: all .2s; }
.bc-bar.dim { background: var(--surface2); border: 1px solid var(--border); }
.bc-bar.lit { background: #E8765C; }
.bc-bar.dim:hover, .bc-bar.lit:hover { background: #D45A3F; transform: scaleY(1.04); transform-origin: bottom; }
.bc-day { font-size: 10px; color: var(--ink3); font-weight: 500; }
.chart-foot { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink2); }
.chart-foot b { color: var(--ink); }
.prog-list { display: flex; flex-direction: column; gap: 10px; }
.prog-row { display: flex; flex-direction: column; gap: 3px; }
.prog-info { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; }
.prog-label { display: flex; align-items: center; gap: 6px; font-weight: 500; color: var(--ink); }
.prog-pct { color: var(--ink2); font-weight: 600; }
.prog-track { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 3px; background: #E8765C; transition: width .4s ease; }
.prog-dev-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.link-list { display: flex; flex-direction: column; gap: 8px; }
.link-row { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 13px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; transition: all .15s; }
.link-row:hover { border-color: #F4A593; background: var(--hover); }
.lnk-slug { font-family: monospace; font-size: 13px; font-weight: 700; color: #D45A3F; white-space: nowrap; min-width: 100px; direction: ltr; }
.lnk-url { font-size: 11.5px; color: var(--ink3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 80px; direction: ltr; }
.pill-wrap { display: flex; gap: 6px; flex-wrap: wrap; }
.pill { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 2px 8px; font-size: 10.5px; color: var(--ink2); white-space: nowrap; font-weight: 500; }
.pill b { color: var(--ink); font-weight: 600; }
.acts { display: flex; gap: 5px; margin-left: auto; }
[dir="rtl"] .acts { margin-left: 0; margin-right: auto; }
.btn-s { padding: 5px 10px; border-radius: 7px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid var(--border); background: var(--surface); color: var(--ink); transition: all .15s; white-space: nowrap; touch-action: manipulation; display: inline-flex; align-items: center; gap: 4px; }
.btn-s:hover { border-color: #F4A593; color: #D45A3F; background: #FBEDE8; }
.btn-s.ok { background: #EDF1EC; color: #3E5F3C; border-color: #8FA68E; }
.btn-s.rm:hover { border-color: #E05252; color: #E05252; background: #FDEAEA; }
.tool-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.t-input { flex: 1; min-width: 160px; padding: 10px 12px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--ink); font-family: inherit; outline: none; transition: all .15s; }
.t-input:focus { border-color: #D45A3F; box-shadow: 0 0 0 3px #FBEDE8; }
.t-input::placeholder { color: var(--ink3); }
.slug-box { display: flex; align-items: center; gap: 3px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 12px; }
.slug-pre { font-size: 11.5px; color: var(--ink3); font-family: monospace; white-space: nowrap; }
.slug-in { border: none; outline: none; background: transparent; font-size: 13px; font-family: monospace; font-weight: 600; color: var(--ink); width: 80px; }
.go-btn { padding: 10px 20px; background: #E8765C; color: white; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; touch-action: manipulation; }
.go-btn:hover { background: #D45A3F; transform: translateY(-1px); }
.go-btn:disabled { background: var(--ink3); cursor: not-allowed; transform: none; }
.qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.qr-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 16px; text-align: center; transition: all .2s; }
.qr-card:hover { border-color: #F4A593; box-shadow: 0 4px 16px rgba(0,0,0,.06); }
.qr-cvs-box { background: white; border-radius: 10px; padding: 8px; display: inline-block; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.qr-slug { font-family: monospace; font-size: 12.5px; font-weight: 700; color: #D45A3F; margin-bottom: 3px; }
.qr-dest { font-size: 10.5px; color: var(--ink3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; margin-bottom: 6px; }
.qr-scans { margin-bottom: 10px; }
.qr-acts { display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; }
.edit-dest-box { margin-top: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px; text-align: left; }
[dir="rtl"] .edit-dest-box { text-align: right; }
.edit-lbl { font-size: 10.5px; font-weight: 600; color: var(--ink3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .5px; }
.edit-row { display: flex; gap: 6px; }
.edit-in { flex: 1; padding: 8px 10px; border: 1.5px solid var(--border); border-radius: 7px; font-size: 12.5px; font-family: monospace; outline: none; direction: ltr; background: var(--surface2); color: var(--ink); }
.edit-in:focus { border-color: #D45A3F; }
.sv-btn { padding: 8px 12px; background: #8FA68E; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; }
.bio-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; align-items: start; }
@media (max-width: 700px) { .bio-grid { grid-template-columns: 1fr; } }
.bio-left { display: flex; flex-direction: column; gap: 12px; }
.bio-url-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #EDF1EC; border: 1px solid #8FA68E; border-radius: 10px; padding: 12px 16px; flex-wrap: wrap; }
.bio-url-txt { font-family: monospace; font-size: 14px; font-weight: 700; color: #3E5F3C; direction: ltr; }
.bio-stat-row { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
.bio-st-num { font-family: 'Cal Sans', sans-serif; font-size: 26px; font-weight: 700; color: #D45A3F; }
.bio-st-lbl { font-size: 12px; color: var(--ink2); font-weight: 500; }
.bio-mock { background: linear-gradient(145deg, #2F2A24 0%, #1E1A14 100%); border-radius: 20px; padding: 26px 22px; color: white; text-align: center; position: relative; overflow: hidden; }
.bio-mock::before { content:''; position:absolute; top:-60px; left:-60px; width:300px; height:300px; background:radial-gradient(circle, rgba(232,118,92,.18), transparent 60%); pointer-events:none; }
.bio-avi { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#E8765C,#E8C66B); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; font-size:22px; position:relative; z-index:1; }
.bio-nm { font-family:'Cal Sans',sans-serif; font-size:16px; font-weight:700; margin-bottom:3px; position:relative; z-index:1; }
.bio-dc { font-size:11px; color:rgba(255,255,255,.6); margin-bottom:14px; position:relative; z-index:1; }
.bio-links { display:flex; flex-direction:column; gap:6px; max-width:220px; margin:0 auto; position:relative; z-index:1; }
.bio-lbtn { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:9px; padding:9px 13px; color:white; font-size:12px; font-weight:500; cursor:pointer; font-family:inherit; transition:all .2s; }
.bio-lbtn:hover { background:rgba(255,255,255,.18); }
.bio-edit { margin-top:14px; padding:10px 20px; background:#E8765C; color:white; border:none; border-radius:9px; font-size:13.5px; font-weight:700; cursor:pointer; font-family:inherit; width:100%; position:relative; z-index:1; transition:all .15s; }
.bio-edit:hover { background:#D45A3F; }
.tool-btn:hover { background:#D45A3F; transform:translateY(-1px); }
.tool-btn:disabled { background:var(--ink3); cursor:not-allowed; transform:none; }
.bio-create-box { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:24px; max-width:520px; margin:0 auto; text-align:center; }
.bio-create-box h2 { font-family:'Cal Sans',sans-serif; font-size:20px; font-weight:700; margin-bottom:8px; color:var(--ink); }
.bio-create-box p { font-size:13.5px; color:var(--ink2); margin-bottom:20px; line-height:1.5; }
.bio-field { display:flex; flex-direction:column; gap:4px; margin-bottom:12px; text-align:left; }
[dir=rtl] .bio-field { text-align:right; }
.bio-field label { font-size:11.5px; font-weight:600; color:var(--ink2); text-transform:uppercase; letter-spacing:.5px; }
.bio-field-hint { font-size:11px; color:var(--ink3); margin-top:2px; }
.bio-toggle-row { display:flex; align-items:center; justify-content:space-between; background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:11px 14px; }
.bio-toggle-label { font-size:13px; font-weight:600; color:var(--ink); }
.bio-toggle { position:relative; width:40px; height:22px; cursor:pointer; }
.bio-toggle input { opacity:0; width:0; height:0; position:absolute; }
.bio-toggle-track { position:absolute; inset:0; background:var(--border2); border-radius:100px; transition:background .2s; }
.bio-toggle input:checked ~ .bio-toggle-track { background:#8FA68E; }
.bio-toggle-thumb { position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
.bio-toggle input:checked ~ .bio-toggle-thumb { transform:translateX(18px); }
.bio-lnk-row { background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:10px 12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.bio-lnk-title { font-size:13px; font-weight:600; color:var(--ink); flex:1; min-width:80px; }
.bio-lnk-url { font-size:11px; color:var(--ink3); direction:ltr; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:2; min-width:80px; }
.bio-add-row { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }
.bio-pub-badge { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:3px 9px; border-radius:100px; }
.bio-pub-badge.on { background:#EDF1EC; color:#3E5F3C; }
.bio-pub-badge.off { background:var(--surface2); color:var(--ink3); }
.sett-form { display:flex; flex-direction:column; gap:16px; max-width:480px; }
.f-lbl { font-size:12.5px; font-weight:600; color:var(--ink3); text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
.f-in { width:100%; padding:11px 13px; background:var(--surface); border:1.5px solid var(--border); border-radius:10px; font-size:14px; color:var(--ink); font-family:inherit; outline:none; transition:all .15s; }
.f-in:focus { border-color:#D45A3F; box-shadow:0 0 0 3px #FBEDE8; }
.f-in option { background:var(--surface); }
.save-btn:hover { background:#D45A3F; transform:translateY(-1px); }
.save-btn.ok { background:#8FA68E; }
.danger-box { margin-top:28px; padding:18px; border:1.5px dashed #E05252; border-radius:12px; background:#FDEAEA; }
.danger-ttl { font-family:'Cal Sans',sans-serif; font-size:15px; font-weight:700; color:#C03030; margin-bottom:6px; }
.danger-sub { font-size:12.5px; color:#A05050; margin-bottom:12px; line-height:1.45; }
.danger-btn { padding:8px 16px; background:#E05252; color:white; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
.empty { text-align:center; padding:28px 16px; }
.empty .ico { font-size:34px; margin-bottom:8px; }
.empty p { font-size:13px; color:var(--ink3); }
.theme-btn { width:36px; height:36px; border-radius:9px; border:1px solid var(--border); background:var(--surface2); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; flex-shrink:0; touch-action:manipulation; }
.theme-btn:hover { background:var(--hover); border-color:#D45A3F; }
.tool-btn { padding:12px 22px; background:#E8765C; color:white; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition:all .15s; white-space:nowrap; touch-action:manipulation; display:inline-flex; align-items:center; gap:6px; }
.save-btn { padding:11px 22px; background:#E8765C; color:white; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; align-self:flex-start; transition:all .15s; touch-action:manipulation; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
.skel-wrap { display:flex; flex-direction:column; min-height:100vh; background:#FBFAF7; align-items:center; justify-content:center; gap:16px; }
.skel-logo { animation: skelPulse 1.4s ease-in-out infinite; }
@keyframes skelPulse { 0%,100%{opacity:.4;} 50%{opacity:1;} }
.skel-bar { height:8px; border-radius:4px; background:#E8E2D6; animation: skelPulse 1.4s ease-in-out infinite; }
`

  if (!user) return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} suppressHydrationWarning/>
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
        <div className="skel-bar" style={{width:120,animationDelay:'.1s'}}/>
        <div className="skel-bar" style={{width:80,animationDelay:'.2s'}}/>
      </div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: css}} suppressHydrationWarning/>
      <div className="wrap" style={theme as React.CSSProperties} dir={dir}>

        <div className={`overlay ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} />

        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              {menuOpen ? <IcoX s={16} c="var(--ink)"/> : <IcoMenu s={16} c="var(--ink)"/>}
            </button>
            <a className="logo-row" href="/">
              <Logo s={30} />
              <span className="logo-name">J2z</span>
            </a>
          </div>
          <div className="topbar-right">
            <button className="theme-btn" onClick={() => setDark(v => !v)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {dark ? <IcoSun s={16} c="var(--ink)"/> : <IcoMoon s={16} c="var(--ink)"/>}
            </button>
            <button className="lang-btn" onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}>
              {lang === 'en' ? 'العربية' : 'EN'}
            </button>
            <div className="avatar">{avatarLetter}</div>
          </div>
        </header>

        <div className="body-row">
          <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
            <nav className="nav-list">
              {TABS.map(tb => (
                <button
                  key={tb.key}
                  className={`nav-btn ${tab === tb.key ? 'active' : ''}`}
                  onClick={() => { setTab(tb.key); setMenuOpen(false); }}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {tb.icon === 'qr' ? <QRIcon s={15} color={tab === tb.key ? 'white' : 'rgba(255,255,255,.55)'}/>
                    : tb.icon === 'grid' ? <IcoGrid s={15} c={tab === tb.key ? 'white' : 'rgba(255,255,255,.55)'}/>
                    : tb.icon === 'link' ? <IcoLink s={15} c={tab === tb.key ? 'white' : 'rgba(255,255,255,.55)'}/>
                    : tb.icon === 'sparkle' ? <IcoSparkle s={15} c={tab === tb.key ? 'white' : 'rgba(255,255,255,.55)'}/>
                    : tb.icon === 'chart' ? <IcoChart s={15} c={tab === tb.key ? 'white' : 'rgba(255,255,255,.55)'}/>
                    : <IcoCog s={15} c={tab === tb.key ? 'white' : 'rgba(255,255,255,.55)'}/>}
                  </span>
                  <span>{lang === 'en' ? tb.label_en : tb.label_ar}</span>
                </button>
              ))}
            </nav>
            <hr className="nav-divider" />
            <div className="nav-bottom">
              <button className="logout-btn" onClick={handleLogout}>
                <span className="nav-icon" aria-hidden="true"><IcoLogout s={15} c="currentColor"/></span>
                <span>{t.logout}</span>
              </button>
            </div>
          </aside>

          <main className="main" key={tab + lang}>

            {tab === 'overview' && <>
              <div className="pg-head">
                <h1 className="pg-title">{greeting}, {displayName} 👋</h1>
                <p className="pg-sub">{t.overview_sub}</p>
              </div>
              <div className="stat-grid">
                {[
                  { lbl:t.total_clicks, val:totalClicks.toLocaleString(), cls:'c-coral', ico:'cursor', bg:'bg-coral', delta:<><b>+18%</b> {t.vs_last}</> },
                  { lbl:t.total_links,  val:links.length,                 cls:'c-sage',  ico:'link',   bg:'bg-sage',  delta:`${t.this_week}: +2` },
                  { lbl:t.total_qr,     val:qrs.length,                   cls:'c-butter', ico:'qr',   bg:'bg-butter', delta:`${t.this_week}: +1` },
                  { lbl:t.total_scans,  val:totalScans.toLocaleString(),   cls:'',        ico:'radio',  bg:'bg-warm',  delta:<><b>+24%</b> {t.vs_last}</> },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-top">
                      <span className="stat-lbl">{s.lbl}</span>
                      <div className={`stat-ico ${s.bg}`} aria-hidden="true">
                        {s.ico === 'qr' ? <QRIcon s={15} color="#A07B1A"/>
                        : s.ico === 'cursor' ? <IcoCursor s={15} c="#D45A3F"/>
                        : s.ico === 'link' ? <IcoLink s={15} c="#3E5F3C"/>
                        : <IcoRadio s={15} c="var(--ink2)"/>}
                      </div>
                    </div>
                    <div className={`stat-num ${s.cls}`}>{s.val}</div>
                    <div className="stat-delta">{s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="grid2">
                <div className="card">
                  <div className="card-hd">{t.weekly} <span className="card-act" onClick={() => setTab('analytics')}>{t.view_all}</span></div>
                  <div className="bar-chart">
                    {WEEKLY.map((v, i) => (
                      <div key={i} className="bc-col">
                        <div className={`bc-bar ${i === 6 ? 'lit' : 'dim'}`} style={{height:`${(v/maxBar)*100}%`}} title={`${v} ${t.clicks}`}/>
                        <span className="bc-day">{DAYS[lang][i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-foot"><span>{t.this_week}</span><b>{weekTotal} {t.clicks}</b></div>
                </div>
                <div className="card">
                  <div className="card-hd">{t.countries}</div>
                  <div className="prog-list">
                    {COUNTRIES.map(c => (
                      <div key={c.code} className="prog-row">
                        <div className="prog-info">
                          <span className="prog-label"><span>{c.flag}</span><span>{lang === 'en' ? c.en : c.ar}</span></span>
                          <span className="prog-pct">{c.pct}%</span>
                        </div>
                        <div className="prog-track"><div className="prog-fill" style={{width:`${c.pct}%`}}/></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-hd">{t.recent} <span className="card-act" onClick={() => setTab('links')}>{t.view_all}</span></div>
                <div className="link-list">
                  {links.slice(0, 3).map(l => (
                    <div key={l.id} className="link-row">
                      <span className="lnk-slug">j2z.com/{l.slug}</span>
                      <span className="lnk-url">{l.url}</span>
                      <div className="pill-wrap">
                        <span className="pill"><IcoCursor s={10} c="var(--ink2)"/> <b>{l.clicks.toLocaleString()}</b></span>
                        <span className="pill"><IcoCalendar s={10} c="var(--ink2)"/> {l.created}</span>
                      </div>
                      <div className="acts">
                        <button className={`btn-s ${copiedId === l.id ? 'ok' : ''}`} onClick={() => copyLink(l.slug, l.id)}>
                          {copiedId === l.id ? t.copied : t.copy}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {tab === 'links' && <>
              <div className="pg-head"><h1 className="pg-title">{t.links}</h1></div>
              <div className="tool-row">
                <input className="t-input" placeholder={t.url_ph} value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} dir="ltr"/>
                <div className="slug-box">
                  <span className="slug-pre">j2z.com/</span>
                  <input className="slug-in" placeholder={t.custom_ph} value={newSlug} onChange={e => setNewSlug(e.target.value.replace(/\s/g, ''))} dir="ltr"/>
                </div>
                <button className="go-btn" onClick={addLink} disabled={!newUrl.trim()}>{t.shorten}</button>
              </div>
              <div className="card">
                {links.length === 0
                  ? <div className="empty"><div className="ico"><IcoLink s={34} c="var(--ink3)"/></div><p>{t.empty_links}</p></div>
                  : <div className="link-list">
                    {links.map(l => (
                      <div key={l.id} className="link-row">
                        <span className="lnk-slug">j2z.com/{l.slug}</span>
                        <span className="lnk-url">{l.url}</span>
                        <div className="pill-wrap">
                          <span className="pill"><IcoCursor s={10} c="var(--ink2)"/> <b>{l.clicks.toLocaleString()}</b> {t.clicks}</span>
                          <span className="pill"><IcoCalendar s={10} c="var(--ink2)"/> {l.created}</span>
                        </div>
                        <div className="acts">
                          <button className={`btn-s ${copiedId === l.id ? 'ok' : ''}`} onClick={() => copyLink(l.slug, l.id)}>{copiedId === l.id ? t.copied : t.copy}</button>
                          <button className="btn-s rm" onClick={() => deleteLink(l.id)}>{t.del}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </>}

            {tab === 'qr' && <>
              <div className="pg-head"><h1 className="pg-title">{t.qr}</h1></div>
              <div className="tool-row">
                <input className="t-input" placeholder={t.qr_ph} value={qrUrl} onChange={e => setQrUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQR()} dir="ltr"/>
                <button className="go-btn" onClick={addQR} disabled={!qrUrl.trim()}>
                  <QRIcon s={14} color="white"/> {t.generate}
                </button>
              </div>
              {qrs.length === 0
                ? <div className="card"><div className="empty"><div className="ico"><QRIcon s={34} color="var(--ink3)"/></div><p>{t.empty_qr}</p></div></div>
                : <div className="qr-grid">
                  {qrs.map(q => (
                    <div key={q.id} className="qr-card">
                      <div className="qr-cvs-box">
                        <canvas
                          ref={el => { qrRefs.current[q.id] = el; if (el) drawQR(el, q.url); }}
                          style={{display:'block', width:100, height:100, imageRendering:'pixelated'}}
                        />
                      </div>
                      <div className="qr-slug">j2z.com/{q.slug}</div>
                      <div className="qr-dest">{q.url}</div>
                      <div className="qr-scans"><span className="pill"><IcoRadio s={10} c="var(--ink2)"/> <b>{q.scans}</b> {t.scans}</span></div>
                      <div className="qr-acts">
                        <button className="btn-s" onClick={() => downloadQR(q.id, q.slug)}><IcoDownload s={13} c="currentColor"/> {t.download}</button>
                        <button className="btn-s" onClick={() => { setEditQrId(editQrId === q.id ? null : q.id); setEditDest(q.url); }}><IcoPencil s={13} c="currentColor"/> {t.edit_dest}</button>
                        <button className="btn-s rm" onClick={() => deleteQr(q.id)}>{t.del}</button>
                      </div>
                      {editQrId === q.id && (
                        <div className="edit-dest-box">
                          <div className="edit-lbl">{t.new_dest}</div>
                          <div className="edit-row">
                            <input className="edit-in" value={editDest} onChange={e => setEditDest(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveQrDest(q.id)} dir="ltr"/>
                            <button className="sv-btn" onClick={() => saveQrDest(q.id)}>✓</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              }
            </>}

            {tab === 'bio' && <>
              <div className="pg-head"><h1 className="pg-title">{t.bio_title}</h1></div>

              {!bioLoaded && (
                <div style={{display:'flex',flexDirection:'column',gap:12,maxWidth:520}}>
                  {[100,75,90,60].map((w,i) => (
                    <div key={i} className="skel-bar" style={{width:`${w}%`,height:i===0?44:28,borderRadius:10,animationDelay:`${i*.08}s`}}/>
                  ))}
                </div>
              )}

              {bioLoaded && !bioPage && (
                <div className="bio-create-box">
                  <h2>{t.bio_create_title}</h2>
                  <p>{t.bio_create_sub}</p>
                  <div className="bio-field">
                    <label>{t.bio_username}</label>
                    <div style={{display:'flex',alignItems:'center',gap:0,background:'var(--surface)',border:'1.5px solid var(--border)',borderRadius:10,overflow:'hidden',transition:'border-color .15s'}}>
                      <span style={{padding:'10px 10px 10px 12px',fontSize:13,color:'var(--ink3)',whiteSpace:'nowrap',fontFamily:'monospace',direction:'ltr'}}>j2z.com/</span>
                      <input className="t-input" style={{border:'none',borderRadius:0,flex:1,boxShadow:'none'}} placeholder="yourname" value={bioForm.username}
                        onChange={e => setBioForm(f => ({...f, username: e.target.value.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,30)}))} dir="ltr"/>
                    </div>
                    <span className="bio-field-hint">{t.bio_username_hint}</span>
                  </div>
                  <div className="bio-field">
                    <label>{t.bio_display_name}</label>
                    <input className="t-input" placeholder={displayName} value={bioForm.display_name}
                      onChange={e => setBioForm(f => ({...f, display_name: e.target.value}))}/>
                  </div>
                  <div className="bio-field">
                    <label>{t.bio_tagline}</label>
                    <input className="t-input" placeholder={lang==='en'?'Creator · Designer · Builder':'مبدع · مصمم · مطور'} value={bioForm.bio}
                      onChange={e => setBioForm(f => ({...f, bio: e.target.value}))}/>
                  </div>
                  {bioError && <div style={{color:'#C03030',fontSize:13,marginBottom:10,padding:'8px 12px',background:'#FDEAEA',borderRadius:8}}>{bioError}</div>}
                  <button className="tool-btn" style={{width:'100%',marginTop:4}} onClick={createBioPage} disabled={bioCreating||!bioForm.username.trim()}>
                    {bioCreating ? t.bio_creating : t.bio_create_btn}
                  </button>
                </div>
              )}

              {bioLoaded && bioPage && (
                <div className="bio-grid">
                  <div className="bio-left">
                    <div className="bio-url-row">
                      <span className="bio-url-txt">j2z.com/u/{bioPage.username}</span>
                      <div style={{display:'flex',gap:6}}>
                        <button className={`btn-s ${copiedId==='bio-link'?'ok':''}`}
                          onClick={()=>{navigator.clipboard.writeText(`j2z.com/u/${bioPage.username}`);setCopiedId('bio-link');setTimeout(()=>setCopiedId(null),1800);}}>
                          {copiedId==='bio-link'?t.copied:t.copy}
                        </button>
                        <a className="btn-s" href={`/u/${bioPage.username}`} target="_blank" rel="noreferrer">{t.bio_view}</a>
                      </div>
                    </div>

                    <div className="bio-toggle-row">
                      <div>
                        <div className="bio-toggle-label">{bioPage.is_published ? t.bio_published : t.bio_unpublished}</div>
                      </div>
                      <label className="bio-toggle">
                        <input type="checkbox" checked={bioPage.is_published} onChange={toggleBioPublish}/>
                        <div className="bio-toggle-track"/>
                        <div className="bio-toggle-thumb"/>
                      </label>
                    </div>

                    {[{val: String(bioLinks.length), lbl:t.bio_links}].map((s, i) => (
                      <div key={i} className="bio-stat-row">
                        <div><div className="bio-st-num">{s.val}</div><div className="bio-st-lbl">{s.lbl}</div></div>
                        <span aria-hidden="true"><IcoLink s={26} c="#D45A3F"/></span>
                      </div>
                    ))}

                    <div className="card">
                      <div className="card-hd">{t.bio_profile}</div>
                      <div className="bio-field" style={{marginBottom:10}}>
                        <label>{t.bio_display_name}</label>
                        <input className="t-input" value={bioForm.display_name}
                          onChange={e => setBioForm(f => ({...f, display_name: e.target.value}))}/>
                      </div>
                      <div className="bio-field" style={{marginBottom:12}}>
                        <label>{t.bio_tagline}</label>
                        <input className="t-input" value={bioForm.bio}
                          onChange={e => setBioForm(f => ({...f, bio: e.target.value}))}/>
                      </div>
                      <button className={`btn-s ${bioSaved?'ok':''}`} onClick={saveBioProfile} disabled={bioSaving}>
                        {bioSaved ? t.s_saved : bioSaving ? t.bio_saving : t.bio_save_profile}
                      </button>
                    </div>

                    <div className="card">
                      <div className="card-hd">{t.bio_your_links}</div>
                      <div className="link-list" style={{marginBottom:12}}>
                        {bioLinks.length === 0 && <div style={{fontSize:13,color:'var(--ink3)',textAlign:'center',padding:'12px 0'}}>{t.bio_no_links}</div>}
                        {bioLinks.map(l => (
                          <div key={l.id} className="bio-lnk-row">
                            {editBioLinkId === l.id ? (
                              <>
                                <input className="t-input" style={{flex:1,minWidth:80}} value={editBioLinkTitle} onChange={e=>setEditBioLinkTitle(e.target.value)}/>
                                <input className="t-input" style={{flex:2,minWidth:100}} value={editBioLinkUrl} onChange={e=>setEditBioLinkUrl(e.target.value)} dir="ltr"/>
                                <button className="btn-s ok" onClick={()=>saveBioLink(l.id)}>{t.save}</button>
                                <button className="btn-s" onClick={()=>setEditBioLinkId(null)}>✕</button>
                              </>
                            ) : (
                              <>
                                <div style={{flex:1,minWidth:80}}><div className="bio-lnk-title">{l.title}</div><div className="bio-lnk-url">{l.url}</div></div>
                                <div className="acts">
                                  <button className="btn-s" onClick={()=>{setEditBioLinkId(l.id);setEditBioLinkTitle(l.title);setEditBioLinkUrl(l.url);}}>{t.edit}</button>
                                  <button className="btn-s rm" onClick={()=>deleteBioLink(l.id)}>{t.del}</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bio-add-row">
                        <input className="t-input" style={{flex:1,minWidth:100}} placeholder={t.bio_link_title} value={newBioTitle} onChange={e=>setNewBioTitle(e.target.value)}/>
                        <input className="t-input" style={{flex:2,minWidth:120}} placeholder={t.bio_link_url} value={newBioUrl} onChange={e=>setNewBioUrl(e.target.value)} dir="ltr"/>
                        <button className="tool-btn" style={{padding:'10px 14px',fontSize:13}} onClick={addBioLink} disabled={!newBioTitle.trim()||!newBioUrl.trim()}>{t.bio_add_link}</button>
                      </div>
                    </div>
                  </div>

                  <div className="bio-mock">
                    <div className="bio-avi">{(bioForm.display_name || displayName)[0]?.toUpperCase() || '?'}</div>
                    <div className="bio-nm">{bioForm.display_name || displayName}</div>
                    <div className="bio-dc">{bioForm.bio || (lang==='en'?'Creator · Designer · Builder':'مبدع · مصمم · مطور')}</div>
                    <div className="bio-links">
                      {bioLinks.length === 0
                        ? (lang==='en'?['My Project','Instagram','Contact Me']:['مشروعي','إنستغرام','تواصل معي']).map((l,i)=><div key={i} className="bio-lbtn" style={{opacity:.4}}>{l}</div>)
                        : bioLinks.map(l=><div key={l.id} className="bio-lbtn">{l.title}</div>)
                      }
                    </div>
                    <div className="bio-url-tag" style={{marginTop:14,fontFamily:'monospace',fontSize:'10.5px',color:'rgba(255,255,255,.5)'}}>
                      j2z.com/u/<strong style={{color:'#F4A593',fontWeight:600}}>{bioPage.username}</strong>
                    </div>
                  </div>
                </div>
              )}
            </>}

            {tab === 'analytics' && <>
              <div className="pg-head"><h1 className="pg-title">{t.analytics}</h1></div>
              <div className="stat-grid">
                {[
                  {lbl:t.total_clicks, val:totalClicks.toLocaleString(), cls:'c-coral', ico:'cursor', bg:'bg-coral', delta:<><b>+18%</b> {t.vs_last}</>},
                  {lbl:t.total_scans, val:totalScans, cls:'', ico:'radio', bg:'bg-warm', delta:<><b>+24%</b> {t.vs_last}</>},
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-top"><span className="stat-lbl">{s.lbl}</span><div className={`stat-ico ${s.bg}`} aria-hidden="true">{s.ico === 'cursor' ? <IcoCursor s={15} c="#D45A3F"/> : <IcoRadio s={15} c="var(--ink2)"/>}</div></div>
                    <div className={`stat-num ${s.cls}`}>{s.val}</div>
                    <div className="stat-delta">{s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="grid2">
                <div className="card">
                  <div className="card-hd">{t.weekly}</div>
                  <div className="bar-chart">
                    {WEEKLY.map((v, i) => (
                      <div key={i} className="bc-col">
                        <div className={`bc-bar ${i === 6 ? 'lit' : 'dim'}`} style={{height:`${(v/maxBar)*100}%`}}/>
                        <span className="bc-day">{DAYS[lang][i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-foot"><span>{t.this_week}</span><b>{weekTotal} {t.clicks}</b></div>
                </div>
                <div className="card">
                  <div className="card-hd">{t.devices}</div>
                  <div className="prog-list">
                    {DEVICES.map(d => (
                      <div key={d.en} className="prog-row">
                        <div className="prog-info">
                          <span className="prog-label"><span className="prog-dev-dot" style={{background:d.color}}/><span>{lang === 'en' ? d.en : d.ar}</span></span>
                          <span className="prog-pct">{d.pct}%</span>
                        </div>
                        <div className="prog-track"><div className="prog-fill" style={{width:`${d.pct}%`, background:d.color}}/></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-hd">{t.countries}</div>
                <div className="prog-list">
                  {COUNTRIES.map(c => (
                    <div key={c.code} className="prog-row">
                      <div className="prog-info">
                        <span className="prog-label"><span>{c.flag}</span><span>{lang === 'en' ? c.en : c.ar}</span></span>
                        <span className="prog-pct">{c.pct}%</span>
                      </div>
                      <div className="prog-track"><div className="prog-fill" style={{width:`${c.pct}%`}}/></div>
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {tab === 'settings' && <>
              <div className="pg-head"><h1 className="pg-title">{t.settings}</h1></div>
              <div className="card" style={{maxWidth:520}}>
                <div className="sett-form">
                  {[
                    {lbl:t.s_name, val:displayName, dir},
                    {lbl:t.s_email, val:user.email ?? '', dir:'ltr'},
                  ].map((f, i) => (
                    <div key={i}><div className="f-lbl">{f.lbl}</div><input className="f-in" defaultValue={f.val} dir={f.dir}/></div>
                  ))}
                  <div>
                    <div className="f-lbl">{t.s_lang}</div>
                    <select className="f-in" value={lang} onChange={e => setLang(e.target.value as Lang)}>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div>
                    <div className="f-lbl">{lang === 'en' ? 'Theme' : 'المظهر'}</div>
                    <div style={{display:'flex', gap:8}}>
                      {([{v:false, l:lang === 'en' ? 'Light' : 'فاتح', icon:<IcoSun s={14} c="currentColor"/>},{v:true, l:lang === 'en' ? 'Dark' : 'داكن', icon:<IcoMoon s={14} c="currentColor"/>}] as {v:boolean;l:string;icon:React.ReactNode}[]).map(o => (
                        <button key={String(o.v)} onClick={() => setDark(o.v)} style={{flex:1, padding:'10px', borderRadius:9, border:`2px solid ${dark === o.v ? '#D45A3F' : 'var(--border)'}`, background:dark === o.v ? '#FBEDE8' : 'var(--surface2)', color:dark === o.v ? '#D45A3F' : 'var(--ink)', fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:'inherit', transition:'all .15s', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, touchAction:'manipulation'}}>
                          {o.icon} {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className={`save-btn ${saved ? 'ok' : ''}`} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
                    {saved ? t.s_saved : t.s_save}
                  </button>
                </div>
                <div className="danger-box">
                  <div className="danger-ttl" style={{display:'flex',alignItems:'center',gap:6}}><IcoWarn s={15} c="#C03030"/> {t.s_danger}</div>
                  <p className="danger-sub">{lang === 'en' ? 'Once deleted, your account and all data cannot be recovered.' : 'بمجرد الحذف، لا يمكن استعادة حسابك وبياناتك.'}</p>
                  <button className="danger-btn">{t.s_delete}</button>
                </div>
              </div>
            </>}

          </main>
        </div>
      </div>
    </>
  )
}
