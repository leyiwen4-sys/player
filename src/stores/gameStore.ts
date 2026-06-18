import { create } from 'zustand'
import type { GameState, GamePhase, StorySegment } from '../types/game'
import type { GameSave } from '../types/save'

interface GameActions {
  setPhase: (phase: GamePhase) => void
  startGame: (worldSetting: string) => void
  appendSegment: (segment: StorySegment) => void
  loadFromSave: (save: GameSave) => void
  setError: (error: string) => void
  clearError: () => void
  resetGame: () => void
  setIsTyping: (typing: boolean) => void
}

const initialState: GameState = {
  phase: 'idle',
  worldSetting: '',
  storyHistory: [],
  currentSegment: null,
  error: null,
  turnCount: 0,
  isTyping: false,
}

export const useGameStore = create<GameState & GameActions>()((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  startGame: (worldSetting) =>
    set({
      ...initialState,
      phase: 'loading',
      worldSetting,
    }),

  appendSegment: (segment) =>
    set((state) => ({
      currentSegment: segment,
      storyHistory: [...state.storyHistory, segment],
      turnCount: state.turnCount + 1,
      phase: segment.isGameOver ? 'gameOver' : 'playing',
    })),

  loadFromSave: (save) =>
    set({
      ...initialState,
      phase: save.storyHistory.length > 0
        ? save.storyHistory[save.storyHistory.length - 1].isGameOver
          ? 'gameOver'
          : 'playing'
        : 'idle',
      worldSetting: save.worldSetting,
      storyHistory: save.storyHistory,
      currentSegment:
        save.storyHistory.length > 0
          ? save.storyHistory[save.storyHistory.length - 1]
          : null,
      turnCount: save.turnCount,
    }),

  setError: (error) => set({ error, phase: 'error' }),
  clearError: () => set({ error: null }),
  resetGame: () => set(initialState),
  setIsTyping: (isTyping) => set({ isTyping }),
}))
