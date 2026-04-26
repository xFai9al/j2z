import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const FLAG_MAP: Record<string, string> = {
  SA: '🇸🇦', AE: '🇦🇪', KW: '🇰🇼', EG: '🇪🇬', US: '🇺🇸',
  GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', TR: '🇹🇷', IN: '🇮🇳',
  PK: '🇵🇰', MA: '🇲🇦', DZ: '🇩🇿', IQ: '🇮🇶', JO: '🇯🇴',
  LB: '🇱🇧', QA: '🇶🇦', BH: '🇧🇭', OM: '🇴🇲', YE: '🇾🇪',
}

const COUNTRY_NAMES: Record<string, { en: string; ar: string }> = {
  SA: { en: 'Saudi Arabia', ar: 'السعودية' },
  AE: { en: 'UAE', ar: 'الإمارات' },
  KW: { en: 'Kuwait', ar: 'الكويت' },
  EG: { en: 'Egypt', ar: 'مصر' },
  US: { en: 'United States', ar: 'أمريكا' },
  GB: { en: 'United Kingdom', ar: 'بريطانيا' },
  DE: { en: 'Germany', ar: 'ألمانيا' },
  FR: { en: 'France', ar: 'فرنسا' },
  TR: { en: 'Turkey', ar: 'تركيا' },
  IN: { en: 'India', ar: 'الهند' },
  PK: { en: 'Pakistan', ar: 'باكستان' },
  MA: { en: 'Morocco', ar: 'المغرب' },
  DZ: { en: 'Algeria', ar: 'الجزائر' },
  IQ: { en: 'Iraq', ar: 'العراق' },
  JO: { en: 'Jordan', ar: 'الأردن' },
  LB: { en: 'Lebanon', ar: 'لبنان' },
  QA: { en: 'Qatar', ar: 'قطر' },
  BH: { en: 'Bahrain', ar: 'البحرين' },
  OM: { en: 'Oman', ar: 'عُمان' },
  YE: { en: 'Yemen', ar: 'اليمن' },
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#E8765C',
  desktop: '#8FA68E',
  tablet: '#E8C66B',
}

const DEVICE_LABELS: Record<string, { en: string; ar: string }> = {
  mobile: { en: 'Mobile', ar: 'موبايل' },
  desktop: { en: 'Desktop', ar: 'حاسوب' },
  tablet: { en: 'Tablet', ar: 'تابلت' },
}

export async function GET() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const { data: clicks } = await sb
    .from('clicks')
    .select('clicked_at, country, device_type, resource_type')
    .gte('clicked_at', sevenDaysAgo.toISOString())

  const empty = {
    weekly: Array(7).fill(0),
    weekTotal: 0,
    countries: [],
    devices: [],
    hasData: false,
  }

  if (!clicks || clicks.length === 0) return NextResponse.json(empty)

  // Weekly aggregation (index 0 = 6 days ago, index 6 = today)
  const weekly = Array(7).fill(0)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  for (const click of clicks) {
    const clickDay = new Date(click.clicked_at)
    clickDay.setHours(0, 0, 0, 0)
    const daysAgo = Math.round((todayStart.getTime() - clickDay.getTime()) / 86400000)
    if (daysAgo >= 0 && daysAgo < 7) weekly[6 - daysAgo]++
  }

  // Country aggregation
  const countryCount: Record<string, number> = {}
  for (const c of clicks) {
    if (c.country) countryCount[c.country] = (countryCount[c.country] ?? 0) + 1
  }
  const countryTotal = Object.values(countryCount).reduce((a, b) => a + b, 0)
  const topCountries = Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([code, count]) => ({
      code,
      en: COUNTRY_NAMES[code]?.en ?? code,
      ar: COUNTRY_NAMES[code]?.ar ?? code,
      pct: countryTotal > 0 ? Math.round((count / countryTotal) * 100) : 0,
      flag: FLAG_MAP[code] ?? '🌍',
    }))

  if (topCountries.length > 0) {
    const topSum = topCountries.reduce((s, c) => s + c.pct, 0)
    if (topSum < 100) {
      topCountries.push({ code: 'OT', en: 'Other', ar: 'أخرى', pct: 100 - topSum, flag: '🌍' })
    }
  }

  // Device aggregation
  const deviceCount: Record<string, number> = {}
  for (const c of clicks) {
    if (c.device_type) deviceCount[c.device_type] = (deviceCount[c.device_type] ?? 0) + 1
  }
  const deviceTotal = Object.values(deviceCount).reduce((a, b) => a + b, 0)
  const devices = Object.entries(deviceCount)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      en: DEVICE_LABELS[type]?.en ?? type,
      ar: DEVICE_LABELS[type]?.ar ?? type,
      pct: deviceTotal > 0 ? Math.round((count / deviceTotal) * 100) : 0,
      color: DEVICE_COLORS[type] ?? '#ccc',
    }))

  return NextResponse.json({
    weekly,
    weekTotal: clicks.length,
    countries: topCountries,
    devices,
    hasData: true,
  })
}
