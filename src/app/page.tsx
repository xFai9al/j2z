import Header from '@/components/Header'
import ShortenForm from '@/components/ShortenForm'
import { Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-12">
        {/* Hero */}
        <div className="text-center space-y-5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Free &amp; instant URL shortener
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Shorten. Share.{' '}
            <span className="text-violet-500 dark:text-violet-400">Track.</span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            Turn long, messy URLs into clean links in one click.
            <br />
            QR codes included — always free.
          </p>
        </div>

        {/* Form */}
        <ShortenForm />

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-4">
          {[
            { icon: '⚡', title: 'Instant', desc: 'Links ready in milliseconds' },
            { icon: '📊', title: 'Click Tracking', desc: 'See how many times your link was clicked' },
            { icon: '🔲', title: 'QR Codes', desc: 'Download QR codes for any short link' },
          ].map(f => (
            <div
              key={f.title}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1"
            >
              <div className="text-2xl">{f.icon}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{f.title}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 text-sm">
        <div className="flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-violet-500" fill="currentColor" />
          <span>j2z.com — Fast URL Shortener</span>
        </div>
      </footer>
    </div>
  )
}
