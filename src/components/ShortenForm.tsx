'use client'

import { useState } from 'react'
import { Link2, ArrowRight, Loader2, Copy, Check, QrCode, ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'

const QRModal = dynamic(() => import('./QRModal'), { ssr: false })

interface ShortenedLink {
  slug: string
  original_url: string
  short_url: string
}

export default function ShortenForm() {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ShortenedLink | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customSlug: showCustom ? customSlug : '' }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setResult(data)
        setUrl('')
        setCustomSlug('')
        setShowCustom(false)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main input row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste a long URL here…"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium flex items-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-violet-500/25"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Shorten
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Custom alias toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowCustom(v => !v)}
            className="text-sm text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
          >
            {showCustom ? '− Hide' : '+ Add'} custom alias
          </button>
        </div>

        {showCustom && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <span className="text-slate-400 dark:text-slate-500 text-sm font-mono whitespace-nowrap select-none">
              j2z.com/
            </span>
            <input
              type="text"
              value={customSlug}
              onChange={e => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
              placeholder="my-alias"
              maxLength={32}
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm font-mono"
            />
          </div>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="px-4 py-4 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 space-y-3">
          <p className="text-slate-500 dark:text-slate-400 text-xs truncate flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3 shrink-0" />
            {result.original_url}
          </p>
          <div className="flex items-center justify-between gap-3">
            <a
              href={result.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-300 font-mono font-semibold text-lg hover:text-violet-700 dark:hover:text-violet-200 transition-colors truncate"
            >
              {result.short_url}
            </a>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => copyToClipboard(result.short_url)}
                title="Copy link"
                className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setQrOpen(true)}
                title="Show QR code"
                className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {qrOpen && result && (
        <QRModal url={result.short_url} onClose={() => setQrOpen(false)} />
      )}
    </div>
  )
}
