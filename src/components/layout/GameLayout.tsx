import { useState, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useSaveStore } from '../../stores/saveStore'
import Header from './Header'
import StoryPanel from '../panels/StoryPanel'
import ChoicePanel from '../panels/ChoicePanel'
import HistoryPanel from '../panels/HistoryPanel'
import SettingsPanel from '../panels/SettingsPanel'
import useAutoScroll from '../../hooks/useAutoScroll'
import type { Choice } from '../../types/game'

interface GameLayoutProps { onChoice: (choice: Choice) => void; onCustomInput: (text: string) => void }

export default function GameLayout({ onChoice, onCustomInput }: GameLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const activeSaveId = useSaveStore((s) => s.activeSaveId)
  const activeSave = useSaveStore((s) => s.saves.find((sv) => sv.id === s.activeSaveId))
  const resetGame = useGameStore((s) => s.resetGame)
  const setActive = useSaveStore((s) => s.setActive)
  const storyHistoryLen = useGameStore((s) => s.storyHistory.length)
  const scrollRef = useRef<HTMLDivElement>(null)
  useAutoScroll(scrollRef, [storyHistoryLen])

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

      {/* Single scrollable feed — story cards + choice cards + panels */}
      <div ref={scrollRef} className="flex-1 pt-12 overflow-y-auto">
        <StoryPanel />
        <ChoicePanel onSelect={onChoice} onCustomInput={onCustomInput} />

        {/* History card */}
        {historyOpen && (
          <div className="bg-white rounded-3xl shadow-cream border border-cream-200 max-h-[50vh] flex flex-col animate-fade-in-up mx-3 my-2">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-base font-heading text-cream-700">故事回顾</span>
              <button onClick={() => setHistoryOpen(false)} className="w-8 h-8 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4"><HistoryPanel embedded /></div>
          </div>
        )}

        {/* Settings card */}
        {settingsOpen && <SettingsPanel key="settings" open={settingsOpen} onClose={() => setSettingsOpen(false)} inline />}
      </div>
    </div>
  )
}
