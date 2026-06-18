import { useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useSaveStore } from '../stores/saveStore'
import { useResourceStore } from '../stores/resourceStore'
import { useSettingsStore } from '../stores/settingsStore'
import { sendMessage } from '../services/deepseek'
import { buildConversationMessages } from '../services/promptBuilder'
import { buildSummaryContext } from '../services/contextManager'
import { parseAIResponse, AIResponseParseError } from '../utils/jsonParser'
import type { StorySegment, Choice } from '../types/game'

export function useGameLoop() {
  const executeTurn = useCallback(async (action: string) => {
    const { apiKey, model, temperature, maxTokens } = useSettingsStore.getState()
    const { worldSetting, storyHistory } = useGameStore.getState()
    const activeId = useSaveStore.getState().activeSaveId

    if (!apiKey) {
      useGameStore.setState({ error: '请先在设置中配置 DeepSeek API Key。', phase: 'error' })
      return
    }

    useGameStore.setState({ phase: 'loading' })

    try {
      const { contextualSegments, summaryText } = buildSummaryContext(storyHistory)
      const messages = buildConversationMessages(worldSetting, contextualSegments, action)

      if (summaryText) {
        messages[0] = {
          role: 'system',
          content: messages[0].content + '\n\n<PREVIOUSLY>\n' + summaryText + '\n</PREVIOUSLY>',
        }
      }

      const rawResponse = await sendMessage(apiKey, model, messages, temperature, maxTokens)
      const aiResponse = parseAIResponse(rawResponse)

      const segment: StorySegment = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2)),
        timestamp: Date.now(),
        narrative: aiResponse.narrative,
        choices: aiResponse.choices.map((c, i) => ({
          id: `choice-${i}`,
          text: c.text,
        })),
        chosenAction: action,
        isGameOver: aiResponse.isGameOver,
        gameOverMessage: aiResponse.gameOverMessage || '',
      }

      useGameStore.getState().appendSegment(segment)
      useGameStore.setState({ setIsTyping: true })

      // Sync to save store
      if (activeId) {
        const state = useGameStore.getState()
        const save = useSaveStore.getState().saves.find((s) => s.id === activeId)
        // Only auto-generate title if user didn't set one
        const shouldAutoTitle = state.storyHistory.length === 1
          && (!save || save.title === '未命名故事')
        const title = shouldAutoTitle
          ? aiResponse.narrative.slice(0, 15)
          : undefined
        useSaveStore.getState().updateSave(activeId, {
          storyHistory: state.storyHistory,
          turnCount: state.turnCount,
          phase: segment.isGameOver ? 'gameOver' : 'playing',
          ...(title ? { title } : {}),
        })
      }
    } catch (err) {
      if (err instanceof AIResponseParseError) {
        try {
          const { apiKey: ak, model: m, temperature: t, maxTokens: mt } = useSettingsStore.getState()
          const { worldSetting: ws, storyHistory: history } = useGameStore.getState()
          const retryMessages = buildConversationMessages(ws, history, action)
          retryMessages.push({
            role: 'user',
            content: '你上一次的回复不是合法的 JSON 格式。请严格按照系统提示中指定的 JSON Schema 回复，只输出 JSON 对象。',
          })
          const rawRetry = await sendMessage(ak, m, retryMessages, 0.3, mt)
          const aiResponse = parseAIResponse(rawRetry)

          const segment: StorySegment = {
            id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2)),
            timestamp: Date.now(),
            narrative: aiResponse.narrative,
            choices: aiResponse.choices.map((c, i) => ({ id: `choice-${i}`, text: c.text })),
            chosenAction: action,
            isGameOver: aiResponse.isGameOver,
            gameOverMessage: aiResponse.gameOverMessage || '',
          }

          useGameStore.getState().appendSegment(segment)
          useGameStore.setState({ setIsTyping: true })

          if (activeId) {
            const state = useGameStore.getState()
            useSaveStore.getState().updateSave(activeId, {
              storyHistory: state.storyHistory,
              turnCount: state.turnCount,
              phase: segment.isGameOver ? 'gameOver' : 'playing',
            })
          }
          return
        } catch {
          useGameStore.setState({ error: 'AI 返回的内容无法解析，请换一个选项重试。', phase: 'error' })
        }
      } else {
        useGameStore.setState({
          error: err instanceof Error ? err.message : '发生未知错误，请检查网络后重试。',
          phase: 'error',
        })
      }
    }
  }, [])

  const startNewGame = useCallback((worldSetting: string, title?: string) => {
    try {
      // Save to resource history
      useResourceStore.getState().addSetting(worldSetting)

      // Create save in save store
      const saveId = useSaveStore.getState().createSave(worldSetting, title)
      useSaveStore.getState().setActive(saveId)

      // Initialize game store (sets phase to 'loading')
      useGameStore.getState().startGame(worldSetting)

      // Execute first turn — use minimal delay, wrapped in try/catch
      setTimeout(() => {
        executeTurn('请开始冒险。描绘开场场景，并给出我的第一个选择。').catch(() => {})
      }, 50)
    } catch (e) {
      console.error('startNewGame failed:', e)
      useGameStore.setState({
        error: '创建游戏失败，请重试。',
        phase: 'error',
      })
    }
  }, [executeTurn])

  const loadSave = useCallback((saveId: string) => {
    const save = useSaveStore.getState().saves.find((s) => s.id === saveId)
    if (!save) return

    useSaveStore.getState().setActive(saveId)
    useGameStore.getState().loadFromSave(save)
  }, [])

  const selectChoice = useCallback((choice: Choice) => {
    executeTurn(choice.text)
  }, [executeTurn])

  const sendCustomInput = useCallback((text: string) => {
    executeTurn(text)
  }, [executeTurn])

  const backToHome = useCallback(() => {
    useSaveStore.getState().setActive(null)
    useGameStore.getState().resetGame()
  }, [])

  return { executeTurn, startNewGame, loadSave, selectChoice, sendCustomInput, backToHome }
}
