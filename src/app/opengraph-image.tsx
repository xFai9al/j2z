import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'j2z — URL Shortener'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FBFAF7',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width={100} height={100} viewBox="0 0 60 60" fill="none">
            <rect x="0" y="0" width="60" height="60" rx="16" fill="#FBEDE8" />
            <rect x="28" y="16" width="5" height="20" fill="#F4A593" />
            <rect x="33" y="13" width="5" height="23" fill="#E8765C" />
            <rect x="38" y="10" width="5" height="26" fill="#D45A3F" />
            <path d="M43 10 L50 10 L43 18 Z" fill="#F4A593" />
            <path d="M12 36 L43 36 L43 48 L20 48 Q12 48 12 42 Z" fill="#D45A3F" />
          </svg>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: '#2F2A24', letterSpacing: -4 }}>
            J2z
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#2F2A24', marginTop: 24, opacity: 0.75 }}>
          Shorten URLs. QR codes. Bio pages.
        </div>
      </div>
    ),
    { ...size }
  )
}
