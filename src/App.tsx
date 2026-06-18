import { useGameStore } from './stores/gameStore'
import { useSaveStore } from './stores/saveStore'
import { useGameLoop } from './hooks/useGameLoop'
import HomeScreen from './components/layout/HomeScreen'
import GameLayout from './components/layout/GameLayout'

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const saves = useSaveStore((s) => s.saves)
  const activeSaveId = useSaveStore((s) => s.activeSaveId)
  const { startNewGame, selectChoice, sendCustomInput, loadSave } = useGameLoop()

  // If we have an active save and game phase is not idle, show game
  if (activeSaveId && phase !== 'idle') {
    return <GameLayout onChoice={selectChoice} onCustomInput={sendCustomInput} />
  }

  return (
    <HomeScreen
      onContinueGame={(saveId) => loadSave(saveId)}
      onNewGame={(worldSetting, title) => startNewGame(worldSetting, title)}
    />
  )
}
