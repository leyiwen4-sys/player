import { useState, useEffect, useRef, useCallback } from 'react'

interface UseTypingAnimationOptions {
  text: string
  speed?: number
}

export default function useTypingAnimation({ text, speed = 40 }: UseTypingAnimationOptions) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)

  const skip = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setDisplayed(text)
    setIsDone(true)
  }, [text])

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setDisplayed('')
    setIsDone(false)
    indexRef.current = 0
    lastTimeRef.current = 0
  }, [])

  useEffect(() => {
    reset()

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastTimeRef.current

      if (elapsed >= speed) {
        lastTimeRef.current = timestamp
        indexRef.current += 1

        if (indexRef.current <= text.length) {
          setDisplayed(text.slice(0, indexRef.current))
        }

        if (indexRef.current >= text.length) {
          setIsDone(true)
          return
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [text, speed, reset])

  return { displayed, isDone, skip }
}
