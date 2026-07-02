export interface FontPairing {
  id: string
  en: string
  ar: string
  display: string
  body: string
  googleFontsQuery: string
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'default',
    en: 'Classic', ar: 'كلاسيكي',
    display: "'Cal Sans','Tajawal',sans-serif",
    body: "'Space Grotesk','Tajawal',sans-serif",
    googleFontsQuery: 'family=Cal+Sans&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800',
  },
  {
    id: 'editorial',
    en: 'Editorial', ar: 'أدبي',
    display: "'Fraunces','Tajawal',serif",
    body: "'Space Grotesk','Tajawal',sans-serif",
    googleFontsQuery: 'family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800',
  },
  {
    id: 'bold',
    en: 'Bold', ar: 'جريء',
    display: "'Archivo Black','Tajawal',sans-serif",
    body: "'Space Grotesk','Tajawal',sans-serif",
    googleFontsQuery: 'family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=Tajawal:wght@500;700;800',
  },
  {
    id: 'mono',
    en: 'Mono', ar: 'مونو',
    display: "'Space Mono','Tajawal',monospace",
    body: "'Space Mono','Tajawal',monospace",
    googleFontsQuery: 'family=Space+Mono:wght@400;700&family=Tajawal:wght@500;700;800',
  },
]

export function getFontPairing(id?: string | null): FontPairing {
  return FONT_PAIRINGS.find(f => f.id === id) ?? FONT_PAIRINGS[0]
}
