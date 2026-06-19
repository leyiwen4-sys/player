import type { Choice } from '../../types/game'

interface ChoiceCardProps {
  choice: Choice
  index: number
  label: string
  onClick: (c: Choice) => void
  disabled: boolean
}

export default function ChoiceCard({ choice, label, onClick, disabled }: ChoiceCardProps) {
  return (
    <button onClick={() => onClick(choice)} disabled={disabled}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 border-cream-200 bg-white/90 shadow-cream
        transition-all duration-200 ease-out cursor-pointer hover:border-cream-400 hover:shadow-cream-lg
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        disabled:hover:shadow-cream disabled:hover:border-cream-200 min-h-[52px] group`}
      style={{ animationDelay: `${parseInt(label.charCodeAt(0) - 65 + '') * 80}ms`, animationFillMode: 'both' }}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-cream-200 text-cream-700 flex items-center justify-center text-sm font-bold group-hover:bg-cream-400 group-hover:text-white transition-colors duration-200">
          {label}
        </span>
        <span className="text-cream-800 text-[15px] leading-snug group-hover:text-cream-900 transition-colors">{choice.text}</span>
      </div>
    </button>
  )
}
