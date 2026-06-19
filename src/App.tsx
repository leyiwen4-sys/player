import { useGameStore } from './stores/gameStore'
import { useSaveStore } from './stores/saveStore'
import { useGameLoop } from './hooks/useGameLoop'
import HomeScreen from './components/layout/HomeScreen'
import GameLayout from './components/layout/GameLayout'
import ErrorBoundary from './components/ui/ErrorBoundary'

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const saves = useSaveStore((s) => s.saves)
  const activeSaveId = useSaveStore((s) => s.activeSaveId)
  const { startNewGame, selectChoice, sendCustomInput, loadSave } = useGameLoop()

  if (activeSaveId && phase !== 'idle') {
    return <ErrorBoundary><GameLayout onChoice={selectChoice} onCustomInput={sendCustomInput} /></ErrorBoundary>
  }

  return (
    <ErrorBoundary>
      <HomeScreen
        onContinueGame={(saveId) => loadSave(saveId)}
        onNewGame={(worldSetting, title) => startNewGame(worldSetting, title)}
      />
    </ErrorBoundary>
  )
}
