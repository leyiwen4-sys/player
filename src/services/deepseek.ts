import type { AIMessage } from '../types/api'

type OpenAIClient = InstanceType<typeof import('openai').default>

let clientPromise: Promise<OpenAIClient> | null = null
let currentApiKey = ''

async function getClient(apiKey: string): Promise<OpenAIClient> {
  if (clientPromise && currentApiKey === apiKey) {
    return clientPromise
  }
  currentApiKey = apiKey
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey,
    dangerouslyAllowBrowser: true,
  })
  // Cache the resolved client directly
  clientPromise = Promise.resolve(client)
  return client
}

export async function sendMessage(
  apiKey: string,
  model: string,
  messages: AIMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  const openai = await getClient(apiKey)

  const response = await openai.chat.completions.create({
    model,
    messages: messages as any,
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
