import type { StorySegment } from '../types/game'

/**
 * Estimates token count from characters (rough: ~1 token per 2 chars for Chinese, ~1 per 4 for English).
 * This is a conservative heuristic.
 */
export function estimateTokens(segments: StorySegment[]): number {
  let totalChars = 0
  for (const seg of segments) {
    totalChars += seg.narrative.length
    totalChars += seg.chosenAction.length
  }
  // Chinese-heavy text: roughly 1.5 chars per token
  return Math.ceil(totalChars / 1.5)
}

/**
 * Summarizes older story segments into a compressed paragraph.
 * Keeps the last `keepRecent` segments intact.
 */
export function summarizeHistory(
  segments: StorySegment[],
  keepRecent: number = 4
): { summary: string; keptSegments: StorySegment[] } {
  if (segments.length <= keepRecent) {
    return { summary: '', keptSegments: segments }
  }

  const toSummarize = segments.slice(0, segments.length - keepRecent)
  const kept = segments.slice(segments.length - keepRecent)

  const summaryParts = toSummarize.map((seg) => {
    const action = seg.chosenAction
    return `【选择了：${action}】${seg.narrative.slice(0, 80)}...`
  })

  const summary = `[前情提要] ${summaryParts.join(' → ')}`

  return { summary, keptSegments: kept }
}

/**
 * Builds a compact summary of past segments for context management.
 * Returns a string that can be inserted after the system prompt.
 */
export function buildSummaryContext(
  segments: StorySegment[],
  maxTokens: number = 8000
): { contextualSegments: StorySegment[]; summaryText: string } {
  const estimated = estimateTokens(segments)

  if (estimated <= maxTokens) {
    return { contextualSegments: segments, summaryText: '' }
  }

  // Keep trimming from the front until we're under the limit
  let keepCount = segments.length
  while (keepCount > 4 && estimateTokens(segments.slice(segments.length - keepCount)) > maxTokens) {
    keepCount--
  }

  const result = summarizeHistory(segments, keepCount)
  return { contextualSegments: result.keptSegments, summaryText: result.summary }
}
