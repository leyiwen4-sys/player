import { useState, useEffect } from 'react'

export function useRelativeTime(timestamp: number): string {
  const [text, setText] = useState(() => formatRelative(timestamp))

  useEffect(() => {
    setText(formatRelative(timestamp))
    const interval = setInterval(() => setText(formatRelative(timestamp)), 60000)
    return () => clearInterval(interval)
  }, [timestamp])

  return text
}

function formatRelative(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`
  return new Date(timestamp).toLocaleDateString('zh-CN')
}
