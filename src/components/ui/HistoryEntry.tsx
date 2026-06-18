import { useState } from 'react'
import type { StorySegment } from '../../types/game'

export default function HistoryEntry({ segment }: { segment: StorySegment }) {
  const [expanded, setExpanded] = useState(false)
  const preview = segment.narrative.slice(0, 60) + (segment.narrative.length > 60 ? '...' : '')
  return (
    <div className="border-l-2 border-cream-200 pl-3 py-1">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left cursor-pointer">
        <div className="flex items-center gap-1.5 mb-0.5">
          <svg className={`w-3 h-3 text-cream-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 16 16"><path d="M6 4l4 4-4 4" /></svg>
          <span className="text-xs text-cream-500 font-medium truncate">{segment.chosenAction.slice(0, 25)}{segment.chosenAction.length > 25 ? '...' : ''}</span>
        </div>
        {!expanded && <p className="text-xs text-cream-500/60 leading-relaxed ml-4">{preview}</p>}
      </button>
      {expanded && (
        <div className="mt-2 ml-4 text-xs text-cream-700 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto bg-cream-50 rounded-xl p-3 border border-cream-100">
          {segment.narrative}
          {segment.isGameOver && <p className="mt-2 text-cream-500 font-semibold">{segment.gameOverMessage || '— 本章完 —'}</p>}
        </div>
      )}
    </div>
  )
}
