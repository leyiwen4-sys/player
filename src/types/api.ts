export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponseChoice {
  text: string
  hint?: string
}

export interface AIResponse {
  narrative: string
  choices: AIResponseChoice[]
  isGameOver: boolean
  gameOverMessage: string
}
