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

      {/* Middle area: story + inline panels — scroll pushes content up when panels open */}
      <div className="flex-1 pt-12 flex flex-col min-h-0 pb-[88px]">
        <StoryPanel />

        {/* Inline history panel — card style, pushes story content up */}
        {historyOpen && (
          <div className="flex-shrink-0 bg-white rounded-3xl shadow-cream border border-cream-200 max-h-[50vh] flex flex-col animate-fade-in-up mx-3 my-2">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-base font-heading text-cream-700">故事回顾</span>
              <button onClick={() => setHistoryOpen(false)} className="w-8 h-8 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4"><HistoryPanel embedded /></div>
          </div>
        )}

        {/* Inline settings panel — pushes story content up */}
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} inline />
      </div>

      {/* Fixed bottom choice/input panel */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <ChoicePanel onSelect={onChoice} onCustomInput={onCustomInput} />
      </div>
    </div>
  )
}
