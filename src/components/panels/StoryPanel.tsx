import { useCallback } from 'react'
import { useGameStore } from '../../stores/gameStore'
import TypingText from '../ui/TypingText'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function StoryPanel() {
  const phase = useGameStore((s) => s.phase)
  const storyHistory = useGameStore((s) => s.storyHistory)
  const isTyping = useGameStore((s) => s.isTyping)
  const setIsTyping = useGameStore((s) => s.setIsTyping)

  // Stable callback — prevents TypingText useEffect from restarting
  const handleTypingComplete = useCallback(() => {
    setIsTyping(false)
  }, [setIsTyping])

  return (
    <div className="px-4 sm:px-6 pt-4 pb-6 space-y-4">
      {storyHistory.map((segment, idx) => {
        const isLatest = idx === storyHistory.length - 1
        const showAction = idx > 0 || segment.chosenAction !== '请开始冒险。描绘开场场景，并给出我的第一个选择。'
        return (
          <div key={segment.id} className="animate-fade-in">
            {showAction && (
              <div className="flex justify-end mb-3">
                <div className="max-w-[80%] bg-cream-200/60 rounded-2xl rounded-br-md px-4 py-2.5">
                  <p className="text-sm text-cream-700 leading-snug">
                    {segment.chosenAction}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-cream border border-cream-100">
              {isLatest && isTyping ? (
                <TypingText text={segment.narrative} onComplete={handleTypingComplete} />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-cream-800">{segment.narrative}</p>
              )}
            </div>

            {segment.isGameOver && (
              <div className="mt-4 text-center">
                <p className="text-cream-500 font-heading text-base">
                  {segment.gameOverMessage || '— 故事完 —'}
                </p>
              </div>
            )}
          </div>
        )
      })}

      {phase === 'loading' && storyHistory.length === 0 && (
        <div className="animate-fade-in bg-white rounded-2xl sm:rounded-3xl p-6 shadow-cream border border-cream-100"><LoadingSpinner /></div>
      )}

      {phase === 'loading' && storyHistory.length > 0 && (
        <div className="animate-fade-in"><LoadingSpinner /></div>
      )}

      {phase === 'error' && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200 text-center">
          <p className="text-red-500 text-sm">{useGameStore.getState().error || '发生了未知错误'}</p>
        </div>
      )}
    </div>
  )
}
