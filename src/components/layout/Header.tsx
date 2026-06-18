import { useGameStore } from '../../stores/gameStore'

interface HeaderProps { title?: string; onOpenSettings: () => void; onOpenHistory: () => void; onBackToHome: () => void }

export default function Header({ title, onOpenSettings, onOpenHistory, onBackToHome }: HeaderProps) {
  const turnCount = useGameStore((s) => s.turnCount)
  return (
    <header className="h-12 flex items-center justify-between px-3 bg-white/85 backdrop-blur-sm border-b border-cream-200 flex-shrink-0">
      <div className="flex items-center gap-1 min-w-0">
        <button onClick={onBackToHome} className="w-9 h-9 rounded-full flex items-center justify-center text-cream-500 hover:bg-cream-100 transition-colors cursor-pointer flex-shrink-0" title="返回首页">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <h1 className="text-sm tracking-wide text-cream-800 truncate max-w-[160px]" style={{ fontFamily: "var(--font-logo)" }}>{title || 'Reading Trip'}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        {turnCount > 0 && <span className="text-xs text-cream-500 bg-cream-100 rounded-full px-2 py-0.5">{turnCount} 回合</span>}
        <button onClick={onOpenHistory} className="w-9 h-9 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer" title="故事回顾">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
        <button onClick={onOpenSettings} className="w-9 h-9 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer" title="设置">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
    </header>
  )
}
