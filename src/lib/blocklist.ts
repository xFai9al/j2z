import type { SupabaseClient } from '@supabase/supabase-js'

/** Returns true if the destination URL matches any url_blocklist entry. */
export async function isUrlBlocked(url: string, sb: SupabaseClient): Promise<boolean> {
  const { data } = await sb.from('url_blocklist').select('pattern, pattern_type')
  if (!data || data.length === 0) return false

  const lower = url.toLowerCase()
  let hostname = ''
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return true
  }

  for (const { pattern, pattern_type } of data) {
    const p = pattern.toLowerCase()
    if (pattern_type === 'domain') {
      if (hostname === p || hostname.endsWith(`.${p}`)) return true
    } else if (pattern_type === 'keyword') {
      if (lower.includes(p)) return true
    } else if (pattern_type === 'regex') {
      try {
        if (new RegExp(pattern, 'i').test(url)) return true
      } catch {}
    }
  }
  return false
}
