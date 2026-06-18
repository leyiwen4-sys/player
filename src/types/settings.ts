export type ModelId = 'deepseek-chat' | 'deepseek-reasoner'

export interface Settings {
  apiKey: string
  model: ModelId
  temperature: number
  maxTokens: number
}
