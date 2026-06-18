import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../stores/gameStore'
import ChoiceCard from '../ui/ChoiceCard'
import type { Choice } from '../../types/game'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

interface ChoicePanelProps {
  onSelect: (choice: Choice) => void
  onCustomInput: (text: string) => void
}

export default function ChoicePanel({ onSelect, onCustomInput }: ChoicePanelProps) {
  const phase = useGameStore((s) => s.phase)
  const currentSegment = useGameStore((s) => s.currentSegment)
  const isTyping = useGameStore((s) => s.isTyping)
  const [input, setInput] = useState('')
  const [choicesVisible, setChoicesVisible] = useState(true)
  const prevChoiceIdsRef = useRef('')
  const choices = currentSegment?.choices ?? []
  const disabled = phase === 'loading' || isTyping || phase === 'gameOver'

  // When new choices arrive (new segment), show them again
  useEffect(() => {
    const currentIds = choices.map((c) => c.id).join(',')
    if (currentIds && currentIds !== prevChoiceIdsRef.current) {
      setChoicesVisible(true)
    }
    prevChoiceIdsRef.current = currentIds
  }, [choices])

  if (phase === 'idle') return null

  if (phase === 'gameOver') {
    return (
      <div className="px-4 sm:px-6 py-4">
        <div className="text-center bg-white/85 backdrop-blur-sm rounded-2xl p-5 border border-cream-200 shadow-cream">
          <p className="text-cream-600 font-heading text-base mb-1">故事已完结</p>
          <p className="text-cream-400 text-xs">返回首页开始新的阅读</p>
        </div>
      </div>
    )
  }

  if (choices.length === 0 && disabled) return null

  const handleSelect = (choice: Choice) => {
    setChoicesVisible(false)
    onSelect(choice)
  }

  const handleSubmit = () => {
    const val = input.trim()
    if (!val || disabled) return

    // Check if input matches a letter choice (A/B/C/D...)
    const upper = val.toUpperCase()
    const idx = upper.charCodeAt(0) - 65
    if (upper.length === 1 && idx >= 0 && idx < choices.length) {
      setChoicesVisible(false)
      onSelect(choices[idx])
    } else {
      // Free text input — send as custom action
      onCustomInput(val)
    }
    setInput('')
  }

  const showChoices = choicesVisible && choices.length > 0 && !disabled

  return (
    <div className="px-4 sm:px-6 py-3">
      <div className="space-y-3 max-w-lg mx-auto">
        {/* Choice hint + cards — collapsible */}
        <div className={`transition-all duration-300 ease-out overflow-hidden ${
          showChoices ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <p className="text-xs text-cream-400 text-center mb-2.5">
            {isTyping ? '故事正在书写中...' : '点击选项 或 输入文字回复'}
          </p>
          <div className="space-y-2.5">
            {choices.map((choice, idx) => (
              <ChoiceCard key={choice.id} choice={choice} index={idx} label={LABELS[idx] || String(idx + 1)} onClick={handleSelect} disabled={disabled} />
            ))}
          </div>
        </div>

        {/* Persistent hint when choices are hidden */}
        {!showChoices && choices.length > 0 && disabled && (
          <p className="text-xs text-cream-400 text-center">故事正在书写中...</p>
        )}

        {/* Input — always visible */}
        {!disabled && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              placeholder={choices.length > 0 ? '输入字母选择 或 直接输入回复...' : '输入你想说的话...'}
              autoComplete="off"
              autoCorrect="off"
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-cream-200 bg-white/90 text-cream-800 text-base placeholder:text-cream-300 focus:outline-none focus:border-cream-400 shadow-cream"
            />
            <button
              onClick={handleSubmit}
              className="px-5 py-3 rounded-2xl bg-cream-800 text-white font-heading text-sm hover:bg-cream-700 active:scale-[0.98] transition-all duration-200 shadow-cream cursor-pointer flex-shrink-0"
            >
              发送
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
