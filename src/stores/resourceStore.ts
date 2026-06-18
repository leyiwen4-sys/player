import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DocumentRecord {
  name: string
  content: string
}

interface ResourceState {
  pastSettings: string[]
  pastDocuments: DocumentRecord[]
  addSetting: (text: string) => void
  addDocument: (name: string, content: string) => void
  removeDocument: (name: string) => void
  clearAll: () => void
}

export const useResourceStore = create<ResourceState>()(
  persist(
    (set) => ({
      pastSettings: [],
      pastDocuments: [],

      addSetting: (text) =>
        set((state) => {
          const trimmed = text.trim()
          if (!trimmed) return state
          // Deduplicate and keep most recent at front, max 20
          const filtered = state.pastSettings.filter((s) => s !== trimmed)
          return { pastSettings: [trimmed, ...filtered].slice(0, 20) }
        }),

      addDocument: (name, content) =>
        set((state) => {
          const trimmed = content.trim()
          if (!trimmed) return state
          const filtered = state.pastDocuments.filter((d) => d.name !== name)
          return {
            pastDocuments: [{ name, content: trimmed }, ...filtered].slice(0, 20),
          }
        }),

      removeDocument: (name) =>
        set((state) => ({
          pastDocuments: state.pastDocuments.filter((d) => d.name !== name),
        })),

      clearAll: () => set({ pastSettings: [], pastDocuments: [] }),
    }),
    { name: 'adventure-resources' }
  )
)
