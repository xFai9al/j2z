import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://j2z.com'),
  title: 'j2z — URL Shortener',
  description: 'Shorten your URLs instantly. Generate QR codes. Track clicks.',
  openGraph: {
    title: 'j2z — URL Shortener',
    description: 'Shorten your URLs instantly. Generate QR codes. Track clicks.',
    url: 'https://j2z.com',
    siteName: 'j2z',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'j2z — URL Shortener',
    description: 'Shorten your URLs instantly. Generate QR codes. Track clicks.',
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
