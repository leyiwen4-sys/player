import OpenAI from 'openai'
import type { AIMessage } from '../types/api'

let client: OpenAI | null = null

export function getClient(apiKey: string): OpenAI {
  if (!client || (client as unknown as { apiKey: string }).apiKey !== apiKey) {
    client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  }
  return client
}

export async function sendMessage(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  const openai = getClient(apiKey)

  const response = await openai.chat.completions.create({
    model,
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI 返回了空回复，请重试。')
  }
  return content
}
