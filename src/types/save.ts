import type { StorySegment } from './game'

export interface GameSave {
  id: string
  title: string
  worldSetting: string
  storyHistory: StorySegment[]
  turnCount: number
  createdAt: number
  updatedAt: number
  phase: 'playing' | 'gameOver'
}

export interface SaveStore {
  saves: GameSave[]
  activeSaveId: string | null
  createSave: (worldSetting: string, title?: string) => string
  updateSave: (id: string, data: Partial<GameSave>) => void
  deleteSave: (id: string) => void
  setActive: (id: string | null) => void
  getActive: () => GameSave | undefined
}
