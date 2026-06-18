import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings, ModelId } from '../types/settings'

interface SettingsActions {
  updateApiKey: (key: string) => void
  updateModel: (model: ModelId) => void
  updateTemperature: (t: number) => void
  updateMaxTokens: (tokens: number) => void
  resetSettings: () => void
}

const defaults: Settings = {
  apiKey: '',
  model: 'deepseek-chat',
  temperature: 0.8,
  maxTokens: 2048,
}

export const useSettingsStore = create<Settings & SettingsActions>()(
  persist(
    (set) => ({
      ...defaults,
      updateApiKey: (apiKey) => set({ apiKey }),
      updateModel: (model) => set({ model }),
      updateTemperature: (temperature) => set({ temperature }),
      updateMaxTokens: (maxTokens) => set({ maxTokens }),
      resetSettings: () => set(defaults),
    }),
    {
      name: 'adventure-settings',
    }
  )
)
