import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'j2z — URL Shortener',
  description: 'Shorten your URLs instantly. Generate QR codes. Track clicks.',
  openGraph: {
    title: 'j2z — URL Shortener',
    description: 'Shorten your URLs instantly. Generate QR codes. Track clicks.',
    url: 'https://j2z.com',
    siteName: 'j2z',
    images: [{ url: 'https://j2z.com/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'j2z — URL Shortener',
    description: 'Shorten your URLs instantly. Generate QR codes. Track clicks.',
    images: ['https://j2z.com/og.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
