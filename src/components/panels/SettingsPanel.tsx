import { useState } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import Modal from '../ui/Modal'
import type { ModelId } from '../../types/settings'

export default function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useSettingsStore()
  const [localKey, setLocalKey] = useState(settings.apiKey)
  return (
    <Modal open={open} onClose={onClose} title="设置">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-cream-700 mb-1.5">DeepSeek API Key</label>
          <input type="password" value={localKey} autoComplete="off" onChange={(e) => setLocalKey(e.target.value)} placeholder="sk-..."
            className="w-full px-4 py-3 rounded-2xl border border-cream-200 bg-cream-50 text-cream-800 text-base placeholder:text-cream-300 focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-200 transition-colors" />
          <p className="mt-1.5 text-xs text-cream-400">API Key 仅存储在浏览器本地，不会上传到任何服务器。</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-cream-700 mb-1.5">模型</label>
          <select value={settings.model} onChange={(e) => settings.updateModel(e.target.value as ModelId)}
            className="w-full px-4 py-3 rounded-2xl border border-cream-200 bg-cream-50 text-cream-800 text-base focus:outline-none focus:border-cream-400 focus:ring-2 focus:ring-cream-200 transition-colors cursor-pointer appearance-none">
            <option value="deepseek-chat">DeepSeek V3（推荐）</option>
            <option value="deepseek-reasoner">DeepSeek R1（深度思考）</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-cream-700 mb-1.5">创意度：{settings.temperature.toFixed(1)}</label>
          <input type="range" min="0" max="2" step="0.1" value={settings.temperature} onChange={(e) => settings.updateTemperature(parseFloat(e.target.value))} className="w-full accent-cream-500 h-2" />
          <div className="flex justify-between text-xs text-cream-300 mt-1"><span>稳定</span><span>疯狂</span></div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-cream-700 mb-1.5">最大字数：{settings.maxTokens}</label>
          <input type="range" min="512" max="4096" step="256" value={settings.maxTokens} onChange={(e) => settings.updateMaxTokens(parseInt(e.target.value))} className="w-full accent-cream-500 h-2" />
          <div className="flex justify-between text-xs text-cream-300 mt-1"><span>简短</span><span>详细</span></div>
        </div>
        <button onClick={() => { settings.updateApiKey(localKey.trim()); onClose() }}
          className="w-full py-3 rounded-2xl bg-cream-800 text-white font-semibold hover:bg-cream-700 active:scale-[0.98] transition-all duration-200 shadow-cream min-h-[48px] cursor-pointer">保存设置</button>
      </div>
    </Modal>
  )
}
