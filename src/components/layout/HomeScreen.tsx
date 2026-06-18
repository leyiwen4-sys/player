import { useState } from 'react'
import { useSaveStore } from '../../stores/saveStore'
import SaveCard from '../ui/SaveCard'
import NewGamePanel from './NewGamePanel'
import SettingsPanel from '../panels/SettingsPanel'

interface HomeScreenProps {
  onContinueGame: (saveId: string) => void
  onNewGame: (worldSetting: string, title: string) => void
}

export default function HomeScreen({ onContinueGame, onNewGame }: HomeScreenProps) {
  const saves = useSaveStore((s) => s.saves)
  const deleteSave = useSaveStore((s) => s.deleteSave)
  const setActive = useSaveStore((s) => s.setActive)
  const [newGameOpen, setNewGameOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleContinue = (id: string) => {
    setActive(id)
    onContinueGame(id)
  }

  const handleNewGame = (worldSetting: string, title: string) => {
    setNewGameOpen(false)
    onNewGame(worldSetting, title)
  }

  return (
    <div className="h-dvh bg-cream-50 flex flex-col">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-cream-50">
        <header className="h-14 flex items-center justify-between px-5">
          <h1 className="text-xl tracking-wide text-cream-800" style={{ fontFamily: "var(--font-logo)" }}>Reading Trip</h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-10 h-10 rounded-full bg-cream-100 text-cream-600 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer"
            title="设置"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>
      </div>

      <p className="text-center text-cream-500 text-sm px-4 mb-2 pt-14">
        开启专属的互动阅读旅程吧！
      </p>

      <div className="flex-1 overflow-y-auto px-4 py-1 pb-24">
        {saves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-20">
            <div className="w-28 h-28 rounded-3xl bg-cream-100 flex items-center justify-center mb-2">
              <svg className="w-12 h-12 text-cream-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-lg font-heading text-cream-500">还没有阅读记录</h2>
            <p className="text-sm text-cream-400 max-w-xs leading-relaxed">
              开启专属的互动阅读旅程吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-24">
            {saves.map((save) => (
              <SaveCard key={save.id} save={save} onContinue={handleContinue} onDelete={deleteSave} />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cream-50 via-cream-50/90 to-transparent">
        <button
          onClick={() => setNewGameOpen(true)}
          className="w-full py-4 rounded-2xl bg-cream-800 text-white font-heading text-base tracking-wide
            transition-all duration-200 hover:bg-cream-700 active:scale-[0.98] shadow-cream-lg cursor-pointer"
        >
          新建故事
        </button>
      </div>

      <NewGamePanel open={newGameOpen} onClose={() => setNewGameOpen(false)} onStart={handleNewGame} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
