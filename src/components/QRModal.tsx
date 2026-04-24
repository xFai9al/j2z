'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { X, Download } from 'lucide-react'

interface Props {
  url: string
  onClose: () => void
}

export default function QRModal({ url, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 240,
      margin: 2,
      color: { dark: '#0f172a', light: '#f8fafc' },
    })
  }, [url])

  function handleDownload() {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.download = `qr-${url.split('/').pop()}.png`
    a.href = canvasRef.current.toDataURL()
    a.click()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 w-full max-w-xs shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">QR Code</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center">
          <canvas ref={canvasRef} className="rounded-xl" />
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-xs text-center font-mono truncate">
          {url}
        </p>

        <button
          onClick={handleDownload}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </div>
  )
}
