'use client'
import { useState } from 'react'

export default function EmailCaptureForm({ username, lang }: { username: string; lang: 'en' | 'ar' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const t = lang === 'ar'
    ? { placeholder: 'بريدك الإلكتروني', btn: 'اشترك', sent: 'تم الاشتراك ✓', error: 'تعذّر الاشتراك، حاول مرة أخرى' }
    : { placeholder: 'your@email.com', btn: 'Subscribe', sent: 'Subscribed ✓', error: 'Something went wrong, try again' }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/bio/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: email.trim() }),
      })
      setStatus(res.ok ? 'sent' : 'error')
      if (res.ok) setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return <div className="email-capture-sent">{t.sent}</div>
  }

  return (
    <form className="email-capture" onSubmit={submit} dir="ltr">
      <input
        className="email-capture-input"
        type="email"
        required
        placeholder={t.placeholder}
        value={email}
        onChange={e => setEmail(e.target.value)}
        aria-label={t.placeholder}
      />
      <button className="email-capture-btn" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? '...' : t.btn}
      </button>
      {status === 'error' && <div className="email-capture-error">{t.error}</div>}
    </form>
  )
}
