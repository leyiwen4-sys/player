import { useEffect, type ReactNode } from 'react'

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (open) { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h) }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-cream-900/15 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-cream-lg border border-cream-200 w-full sm:max-w-md max-h-[85dvh] overflow-y-auto animate-slide-up sm:animate-fade-in-up p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-heading text-cream-700">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
