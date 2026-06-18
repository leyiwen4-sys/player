import { useState, useCallback } from 'react'
import type { GameSave } from '../../types/save'
import { getCoverGradient } from '../../utils/coverGradient'
import { useRelativeTime } from '../../hooks/useRelativeTime'

interface SaveCardProps { save: GameSave; onContinue: (id: string) => void; onDelete: (id: string) => void }

export default function SaveCard({ save, onContinue, onDelete }: SaveCardProps) {
  const [showDelete, setShowDelete] = useState(false)
  const relativeTime = useRelativeTime(save.updatedAt)
  const gradient = getCoverGradient(save.title)
  const preview = save.storyHistory.length > 0
    ? save.storyHistory[save.storyHistory.length - 1].narrative.slice(0, 40) + '...'
    : '点击开始你的阅读...'

  const handleLongPress = useCallback(() => {
    const timer = setTimeout(() => setShowDelete(true), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative group">
      <button
        onClick={() => onContinue(save.id)}
        onTouchStart={handleLongPress}
        onTouchEnd={() => setShowDelete(false)}
        className="w-full text-left rounded-3xl overflow-hidden shadow-cream border border-cream-200/80 bg-white
          cursor-pointer transition-all duration-200 hover:shadow-cream-lg active:scale-[0.98]"
      >
        <div className={`h-20 bg-gradient-to-br ${gradient} relative`}>
          {save.phase === 'gameOver' && (
            <span className="absolute top-2 right-2 text-[10px] bg-white/80 text-cream-700 px-2 py-0.5 rounded-full">已完结</span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-cream-900 truncate">{save.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-cream-500">
            <span>{save.turnCount} 回合</span>
            <span className="text-cream-300">·</span>
            <span>{relativeTime}</span>
          </div>
          <p className="text-[11px] text-cream-500/70 mt-1.5 leading-relaxed line-clamp-2">{preview}</p>
        </div>
      </button>

      {showDelete && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10 animate-fade-in">
          <div className="text-center">
            <p className="text-sm text-cream-700 mb-3">删除这个存档？</p>
            <div className="flex gap-2 justify-center">
              <button onClick={(e) => { e.stopPropagation(); setShowDelete(false) }}
                className="px-4 py-2 rounded-2xl bg-cream-100 text-cream-700 text-sm hover:bg-cream-200 transition-colors cursor-pointer">取消</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(save.id); setShowDelete(false) }}
                className="px-4 py-2 rounded-2xl bg-red-100 text-red-600 text-sm hover:bg-red-200 transition-colors cursor-pointer">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
