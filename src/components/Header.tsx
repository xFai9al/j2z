'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100 font-mono">
          j2z
        </span>
      </div>

      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      )}
    </header>
  )
}
