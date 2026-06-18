export interface Choice {
  id: string
  text: string
}

export interface StorySegment {
  id: string
  timestamp: number
  narrative: string
  choices: Choice[]
  chosenAction: string
  isGameOver: boolean
  gameOverMessage: string
}

export type GamePhase = 'idle' | 'loading' | 'playing' | 'gameOver' | 'error'

export interface GameState {
  phase: GamePhase
  worldSetting: string
  storyHistory: StorySegment[]
  currentSegment: StorySegment | null
  error: string | null
  turnCount: number
  isTyping: boolean
}
