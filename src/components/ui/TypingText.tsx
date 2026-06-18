import { useState, useEffect, useRef } from 'react'

export default function TypingText({ text, speed = 40, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    setDisplayed(''); setIsDone(false); indexRef.current = 0; lastTimeRef.current = 0
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp
      if (timestamp - lastTimeRef.current >= speed) {
        lastTimeRef.current = timestamp; indexRef.current += 1
        if (indexRef.current <= text.length) setDisplayed(text.slice(0, indexRef.current))
        if (indexRef.current >= text.length) { setIsDone(true); onComplete?.(); return }
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [text, speed, onComplete])

  return (
    <div className="relative">
      <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-cream-800">
        {displayed}
        {!isDone && <span className="inline-block w-[2px] h-[1em] bg-cream-400 align-text-bottom animate-pulse rounded-full ml-0.5" />}
      </p>
      {!isDone && displayed.length > 30 && (
        <button onClick={() => { if (rafRef.current) cancelAnimationFrame(rafRef.current); setDisplayed(text); setIsDone(true); onComplete?.() }}
          className="mt-3 text-xs text-cream-400 hover:text-cream-500 transition-colors underline underline-offset-2 cursor-pointer">跳过动画 ▸</button>
      )}
    </div>
  )
}
