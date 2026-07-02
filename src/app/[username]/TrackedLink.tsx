'use client'
import type { ReactNode, CSSProperties } from 'react'

export default function TrackedLink({
  id, href, className, style, ariaLabel, children,
}: {
  id: string
  href: string
  className?: string
  style?: CSSProperties
  ariaLabel?: string
  children: ReactNode
}) {
  const track = () => {
    try {
      navigator.sendBeacon('/api/bio/click', JSON.stringify({ id }))
    } catch {}
  }

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      aria-label={ariaLabel}
      onClick={track}
    >
      {children}
    </a>
  )
}
