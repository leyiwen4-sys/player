import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameSave } from '../types/save'

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  )
}

interface SaveActions {
  createSave: (worldSetting: string, title?: string) => string
  updateSave: (id: string, data: Partial<GameSave>) => void
  deleteSave: (id: string) => void
  setActive: (id: string | null) => void
  getActive: () => GameSave | undefined
}

const initialState = {
  saves: [] as GameSave[],
  activeSaveId: null as string | null,
}

export const useSaveStore = create<typeof initialState & SaveActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      createSave: (worldSetting, title) => {
        const id = uid()
        const now = Date.now()
        const save: GameSave = {
          id,
          title: title || '未命名故事',
          worldSetting,
          storyHistory: [],
          turnCount: 0,
          createdAt: now,
          updatedAt: now,
          phase: 'playing',
        }
        set((state) => ({
          saves: [save, ...state.saves],
          activeSaveId: id,
        }))
        return id
      },

      updateSave: (id, data) =>
        set((state) => ({
          saves: state.saves.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: Date.now() } : s
          ),
        })),

      deleteSave: (id) =>
        set((state) => ({
          saves: state.saves.filter((s) => s.id !== id),
          activeSaveId: state.activeSaveId === id ? null : state.activeSaveId,
        })),

      setActive: (id) => set({ activeSaveId: id }),

      getActive: () => {
        const { saves, activeSaveId } = get()
        return saves.find((s) => s.id === activeSaveId)
      },
    }),
    { name: 'adventure-saves' }
  )
)
