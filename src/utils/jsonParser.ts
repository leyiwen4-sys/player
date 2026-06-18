import type { AIResponse } from '../types/api'

export class AIResponseParseError extends Error {
  raw: string
  constructor(message: string, raw: string) {
    super(message)
    this.name = 'AIResponseParseError'
    this.raw = raw
  }
}

function validateAndCoerce(data: unknown): AIResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Response is not an object')
  }

  const obj = data as Record<string, unknown>

  if (typeof obj.narrative !== 'string' || !obj.narrative.trim()) {
    throw new Error('Missing or empty "narrative" field')
  }

  const choices = Array.isArray(obj.choices)
    ? obj.choices
        .filter(
          (c: unknown) =>
            c && typeof c === 'object' && typeof (c as Record<string, unknown>).text === 'string'
        )
        .map((c: unknown) => ({
          text: (c as Record<string, unknown>).text as string,
          hint: typeof (c as Record<string, unknown>).hint === 'string'
            ? ((c as Record<string, unknown>).hint as string)
            : undefined,
        }))
    : []

  if (choices.length === 0) {
    // Provide a fallback choice
    choices.push({ text: '继续前进...' })
  }

  return {
    narrative: obj.narrative as string,
    choices: choices as AIResponse['choices'],
    isGameOver: obj.isGameOver === true,
    gameOverMessage:
      typeof obj.gameOverMessage === 'string' ? obj.gameOverMessage : '',
  }
}

export function parseAIResponse(raw: string): AIResponse {
  // Step 1: Try direct JSON.parse
  try {
    return validateAndCoerce(JSON.parse(raw))
  } catch {
    /* continue */
  }

  // Step 2: Strip markdown code fences
  const stripped = raw
    .replace(/^```(?:json)?\s*\n?/gm, '')
    .replace(/\n?```\s*$/gm, '')
  try {
    return validateAndCoerce(JSON.parse(stripped))
  } catch {
    /* continue */
  }

  // Step 3: Extract first JSON object with regex
  const match = raw.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      return validateAndCoerce(JSON.parse(match[0]))
    } catch {
      /* continue */
    }
  }

  throw new AIResponseParseError(
    '无法解析 AI 返回的内容，请重试或换一个选项。',
    raw
  )
}
