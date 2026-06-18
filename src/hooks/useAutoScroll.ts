import { useEffect, type RefObject } from 'react'

export default function useAutoScroll(
  containerRef: RefObject<HTMLDivElement | null>,
  deps: unknown[]
) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Find the actual scrollable child inside
    const scrollable = el.querySelector('.overflow-y-auto') || el
    if (scrollable) {
      scrollable.scrollTop = scrollable.scrollHeight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
