import { useState, useRef, useCallback } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useResourceStore } from '../../stores/resourceStore'
import mammoth from 'mammoth'

type Tab = 'text' | 'file' | 'history'

interface NewGamePanelProps {
  open: boolean; onClose: () => void; onStart: (worldSetting: string, title: string) => void; inline?: boolean
}

export default function NewGamePanel({ open, onClose, onStart, inline = false }: NewGamePanelProps) {
  const [tab, setTab] = useState<Tab>('text')
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [uploadedName, setUploadedName] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const apiKey = useSettingsStore((s) => s.apiKey)
  const resourceStore = useResourceStore()
  const canStart = apiKey.trim() && text.trim()

  const handleFile = useCallback(async (file: File) => {
    setUploadError(null)
    try {
      const MAX_SIZE = 512 * 1024 // 512KB max
      if (file.size > MAX_SIZE) {
        setUploadError(`文件过大（${(file.size / 1024).toFixed(0)}KB），请上传小于 512KB 的文件`)
        return
      }
      const ext = file.name.split('.').pop()?.toLowerCase(); let content = ''

      if (ext === 'txt') {
        // Try UTF-8 first, fall back to GBK for Chinese Windows files
        try {
          content = await file.text()
        } catch {
          const buf = await file.arrayBuffer()
          try { content = new TextDecoder('utf-8').decode(buf) } catch { /* fall through */ }
          if (!content.trim()) {
            try { content = new TextDecoder('gbk').decode(buf) } catch { /* fall through */ }
          }
        }
      } else if (ext === 'docx' || ext === 'doc') {
        // Try mammoth for both .docx and .doc (many .doc files are actually .docx ZIPs)
        const buf = await file.arrayBuffer()
        // Check if it's really a ZIP-based docx (starts with PK magic bytes)
        const isZip = new Uint8Array(buf.slice(0, 2))[0] === 0x50 && new Uint8Array(buf.slice(0, 2))[1] === 0x4B
        if (isZip) {
          const result = await mammoth.extractRawText({ arrayBuffer: buf })
          content = result.value
        } else {
          setUploadError('旧版 .doc 格式不支持，请用 Word 或 WPS 另存为 .docx 或 .txt 后再上传')
          return
        }
      } else {
        setUploadError(`不支持的文件格式 .${ext}，请上传 TXT 或 DOCX 文件`)
        return
      }
      if (!content.trim()) {
        setUploadError('文件内容为空，请检查文件')
        return
      }
      setText(content.trim()); setUploadedName(file.name)
      if (content.length > 10000) {
        setUploadError(`文件内容较长（约${Math.round(content.length / 1000)}千字），AI 可能无法完整处理，建议精简后再上传`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[NewGamePanel] File upload error:', msg)
      setUploadError(`文件读取失败：${msg || '未知错误'}`)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]; if (file) handleFile(file)
  }, [handleFile])

  const handleStart = () => {
    if (!canStart) return
    resourceStore.addSetting(text.trim())
    if (uploadedName) resourceStore.addDocument(uploadedName, text.trim())
    onStart(text.trim(), title.trim() || '未命名故事')
    setText(''); setTitle(''); setUploadedName(null); setTab('text')
  }

  if (!open) return null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'text', label: '输入文字' }, { key: 'file', label: '上传文档' }, { key: 'history', label: '历史记录' },
  ]

  // Inline mode — panel pushes content, no overlay
  if (inline) {
    return (
      <div className="bg-white rounded-3xl shadow-cream border border-cream-200 max-h-[50vh] flex flex-col animate-fade-in-up flex-shrink-0 mx-3 my-2">
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-base font-heading text-cream-700">新建故事</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex gap-1 px-4 py-3 border-b border-cream-100">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-colors duration-200 cursor-pointer ${
                tab === t.key ? 'bg-cream-800 text-white' : 'bg-cream-100 text-cream-600 hover:bg-cream-200'}`}>{t.label}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-cream-500 mb-1.5">故事名称</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给我的故事起个名字..." maxLength={30}
              className="w-full px-4 py-3.5 rounded-2xl border border-cream-200 bg-cream-50/60 text-cream-800 placeholder:text-cream-300 focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-200 transition-colors text-base" />
          </div>
          {tab === 'text' && (
            <textarea value={text} onChange={(e) => { setText(e.target.value); setUploadedName(null) }}
              placeholder="描述你的故事世界..." rows={4}
              className="w-full px-4 py-3.5 rounded-2xl border border-cream-200 bg-cream-50/60 text-cream-800 placeholder:text-cream-300 focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-200 transition-colors resize-none text-base leading-relaxed" />
          )}
          {tab === 'file' && (
            <>
              <input ref={fileRef} type="file" accept=".txt,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                  dragOver ? 'border-cream-400 bg-cream-100 scale-[1.02]' : uploadedName ? 'border-cream-300 bg-cream-50' : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50/50'}`}>
                {uploadedName ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-cream-600">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <span className="truncate">{uploadedName}</span>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedName(null); setText('') }} className="w-6 h-6 rounded-full bg-cream-200 text-cream-600 hover:bg-cream-300 transition-colors flex items-center justify-center text-xs flex-shrink-0">✕</button>
                  </div>
                ) : (
                  <div className="text-sm text-cream-400">
                    <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                    点击或拖拽上传 TXT/DOC 文件
                  </div>
                )}
              </div>
              {uploadedName && text && (
                <div className="mt-3 p-3 rounded-2xl bg-cream-50 border border-cream-100 text-xs text-cream-600 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap">{text.slice(0, 300)}{text.length > 300 ? '...' : ''}</div>
              )}
              {uploadError && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-700">{uploadError}</div>
              )}
            </>
          )}
          {tab === 'history' && (
            <div className="space-y-4">
              {resourceStore.pastSettings.length > 0 && (
                <div>
                  <p className="text-xs text-cream-400 mb-2 font-medium">之前的设定</p>
                  <div className="space-y-2">
                    {resourceStore.pastSettings.map((s, i) => (
                      <button key={i} onClick={() => { setText(s); setUploadedName(null); setTab('text') }}
                        className="w-full text-left p-3 rounded-2xl bg-cream-50 border border-cream-100 text-xs text-cream-700 hover:bg-cream-100 transition-colors cursor-pointer leading-relaxed line-clamp-3">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {resourceStore.pastDocuments.length > 0 && (
                <div>
                  <p className="text-xs text-cream-400 mb-2 font-medium">之前上传的文档</p>
                  <div className="space-y-2">
                    {resourceStore.pastDocuments.map((doc) => (
                      <button key={doc.name} onClick={() => { setText(doc.content); setUploadedName(doc.name); setTab('file') }}
                        className="w-full text-left p-3 rounded-2xl bg-cream-50 border border-cream-100 flex items-center gap-2 hover:bg-cream-100 transition-colors cursor-pointer">
                        <svg className="w-4 h-4 text-cream-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        <span className="text-xs text-cream-600 truncate">{doc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {resourceStore.pastSettings.length === 0 && resourceStore.pastDocuments.length === 0 && (
                <div className="text-center py-8 text-sm text-cream-400">还没有历史记录，开始你的第一次阅读吧</div>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-cream-100 space-y-3">
          {!apiKey && <div className="p-3 rounded-2xl bg-cream-100 text-sm text-cream-600 text-center">请先在设置中配置 DeepSeek API Key</div>}
          <button onClick={handleStart} disabled={!canStart}
            className="w-full py-4 rounded-2xl bg-cream-800 text-white font-heading text-base tracking-wide transition-all duration-200 hover:bg-cream-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer">开始阅读</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-cream-900/15 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl shadow-cream-lg border-t border-cream-200 max-h-[85dvh] flex flex-col animate-slide-up">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1.5 rounded-full bg-cream-200" /></div>
        <div className="flex items-center justify-between px-5 py-2 border-b border-cream-100">
          <span className="text-sm font-heading text-cream-700">新建故事</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-cream-100 text-cream-500 hover:bg-cream-200 transition-colors flex items-center justify-center cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-1 px-4 py-3 border-b border-cream-100">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-colors duration-200 cursor-pointer ${
                tab === t.key ? 'bg-cream-800 text-white' : 'bg-cream-100 text-cream-600 hover:bg-cream-200'}`}>{t.label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-cream-500 mb-1.5">故事名称</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="给我的故事起个名字..." maxLength={30}
              className="w-full px-4 py-3.5 rounded-2xl border border-cream-200 bg-cream-50/60 text-cream-800 placeholder:text-cream-300 focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-200 transition-colors text-base" />
          </div>

          {tab === 'text' && (
            <textarea value={text} onChange={(e) => { setText(e.target.value); setUploadedName(null) }}
              placeholder="描述你的故事世界..." rows={6}
              className="w-full px-4 py-3.5 rounded-2xl border border-cream-200 bg-cream-50/60 text-cream-800 placeholder:text-cream-300 focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-200 transition-colors resize-none text-base leading-relaxed" />
          )}

          {tab === 'file' && (
            <>
              <input ref={fileRef} type="file" accept=".txt,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                  dragOver ? 'border-cream-400 bg-cream-100 scale-[1.02]' : uploadedName ? 'border-cream-300 bg-cream-50' : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50/50'}`}>
                {uploadedName ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-cream-600">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <span className="truncate">{uploadedName}</span>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedName(null); setText('') }} className="w-6 h-6 rounded-full bg-cream-200 text-cream-600 hover:bg-cream-300 transition-colors flex items-center justify-center text-xs flex-shrink-0">✕</button>
                  </div>
                ) : (
                  <div className="text-sm text-cream-400">
                    <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                    点击或拖拽上传 TXT/DOC 文件
                  </div>
                )}
              </div>
              {uploadedName && text && (
                <div className="mt-3 p-3 rounded-2xl bg-cream-50 border border-cream-100 text-xs text-cream-600 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap">{text.slice(0, 300)}{text.length > 300 ? '...' : ''}</div>
              )}
              {uploadError && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-700">{uploadError}</div>
              )}
            </>
          )}

          {tab === 'history' && (
            <div className="space-y-4">
              {resourceStore.pastSettings.length > 0 && (
                <div>
                  <p className="text-xs text-cream-400 mb-2 font-medium">之前的设定</p>
                  <div className="space-y-2">
                    {resourceStore.pastSettings.map((s, i) => (
                      <button key={i} onClick={() => { setText(s); setUploadedName(null); setTab('text') }}
                        className="w-full text-left p-3 rounded-2xl bg-cream-50 border border-cream-100 text-xs text-cream-700 hover:bg-cream-100 transition-colors cursor-pointer leading-relaxed line-clamp-3">{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {resourceStore.pastDocuments.length > 0 && (
                <div>
                  <p className="text-xs text-cream-400 mb-2 font-medium">之前上传的文档</p>
                  <div className="space-y-2">
                    {resourceStore.pastDocuments.map((doc) => (
                      <button key={doc.name} onClick={() => { setText(doc.content); setUploadedName(doc.name); setTab('file') }}
                        className="w-full text-left p-3 rounded-2xl bg-cream-50 border border-cream-100 flex items-center gap-2 hover:bg-cream-100 transition-colors cursor-pointer">
                        <svg className="w-4 h-4 text-cream-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        <span className="text-xs text-cream-600 truncate">{doc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {resourceStore.pastSettings.length === 0 && resourceStore.pastDocuments.length === 0 && (
                <div className="text-center py-8 text-sm text-cream-400">还没有历史记录，开始你的第一次阅读吧</div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-cream-100 space-y-3">
          {!apiKey && <div className="p-3 rounded-2xl bg-cream-100 text-sm text-cream-600 text-center">请先在设置中配置 DeepSeek API Key</div>}
          <button onClick={handleStart} disabled={!canStart}
            className="w-full py-4 rounded-2xl bg-cream-800 text-white font-heading text-base tracking-wide transition-all duration-200 hover:bg-cream-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer">开始阅读</button>
        </div>
      </div>
    </div>
  )
}
