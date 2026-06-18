import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useSaveStore } from '../../stores/saveStore'
import Header from './Header'
import StoryPanel from '../panels/StoryPanel'
import ChoicePanel from '../panels/ChoicePanel'
import HistoryPanel from '../panels/HistoryPanel'
import SettingsPanel from '../panels/SettingsPanel'
import type { Choice } from '../../types/game'

interface GameLayoutProps { onChoice: (choice: Choice) => void; onCustomInput: (text: string) => void }

export default function GameLayout({ onChoice, onCustomInput }: GameLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const activeSaveId = useSaveStore((s) => s.activeSaveId)
  const activeSave = useSaveStore((s) => s.saves.find((sv) => sv.id === s.activeSaveId))
  const resetGame = useGameStore((s) => s.resetGame)
  const setActive = useSaveStore((s) => s.setActive)

  const handleBackToHome = () => {
    if (activeSaveId) {
      const state = useGameStore.getState()
      useSaveStore.getState().updateSave(activeSaveId, {
        storyHistory: state.storyHistory, turnCount: state.turnCount,
        phase: state.currentSegment?.isGameOver ? 'gameOver' : 'playing',
      })
    }
    setActive(null); resetGame()
  }

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-br from-cream-50 via-white to-cream-100/30">
      {/* Fixed header — always visible */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <Header title={activeSave?.title} onOpenSettings={() => setSettingsOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)} onBackToHome={handleBackToHome} />
      </div>

      {/* Scrollable story area — padded for fixed header + bottom panel */}
      <div className="flex-1 pt-12 min-h-0">
        <StoryPanel />
      </div>

      {/* Fixed bottom choice/input panel */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <ChoicePanel onSelect={onChoice} onCustomInput={onCustomInput} />
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-cream-900/15 backdrop-blur-sm" onClick={() => setHistoryOpen(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-cream-lg border-t border-cream-200 max-h-[70dvh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1.5 rounded-full bg-cream-200" /></div>
            <div className="flex items-center justify-between px-5 py-2 border-b border-cream-100">
              <span className="text-sm font-heading text-cream-600">故事回顾</span>
              <button onClick={() => setHistoryOpen(false)} className="w-8 h-8 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4"><HistoryPanel embedded /></div>
          </div>
        </div>
      )}

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
