import { useGameStore } from '../../stores/gameStore'
import HistoryEntry from '../ui/HistoryEntry'

export default function HistoryPanel({ embedded }: { embedded?: boolean }) {
  const storyHistory = useGameStore((s) => s.storyHistory)
  if (storyHistory.length === 0) return null
  if (embedded) return <div className="space-y-2">{storyHistory.map((s) => <HistoryEntry key={s.id} segment={s} />)}</div>
  return (
    <div className="hidden lg:block w-64 bg-white/70 backdrop-blur-sm border-l border-cream-200 overflow-y-auto flex-shrink-0">
      <div className="p-3 border-b border-cream-100"><span className="text-xs font-heading text-cream-600">故事回顾</span></div>
      <div className="p-3 space-y-2">{storyHistory.map((s) => <HistoryEntry key={s.id} segment={s} />)}</div>
    </div>
  )
}
