import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function Settings() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const excludeHistoryDays = useStore((s) => s.excludeHistoryDays)
  const setExcludeHistoryDays = useStore((s) => s.setExcludeHistoryDays)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cantdecide-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('✅ 数据已导出')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.categories || data.history) {
          importData(data)
          showToast('✅ 数据已导入')
        } else {
          showToast('❌ 文件格式不正确')
        }
      } catch {
        showToast('❌ JSON 解析失败')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-6 relative">
      <h1 className="text-2xl font-bold">⚙️ 设置</h1>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-strong px-6 py-3 text-sm font-medium"
        >
          {toast}
        </motion.div>
      )}

      {/* 主题切换 */}
      <div className="glass p-4">
        <h3 className="font-semibold mb-3">🎨 主题风格</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('glass')}
            className={`p-4 rounded-[var(--radius)] transition-all text-left ${
              theme === 'glass'
                ? 'glass-strong border-[var(--border-glow)]'
                : 'glass opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-3xl mb-2">🫧</div>
            <div className="font-semibold text-sm">毛玻璃霓虹</div>
            <div className="text-xs text-[var(--text-muted)]">模糊质感，现代风格</div>
          </button>
          <button
            onClick={() => setTheme('pixel')}
            className={`p-4 rounded-[var(--radius)] transition-all text-left ${
              theme === 'pixel'
                ? 'glass-strong border-[var(--border-glow)]'
                : 'glass opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-3xl mb-2">👾</div>
            <div className="font-semibold text-sm">复古像素风</div>
            <div className="text-xs text-[var(--text-muted)]">块状光影，怀旧游戏</div>
          </button>
        </div>
      </div>

      {/* 历史不重复 */}
      <div className="glass p-4">
        <h3 className="font-semibold mb-3">⏳ 历史不重复</h3>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          近期抽中过的选项会降低再次被抽中的概率，天数越大越不容易重复
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="30"
            value={excludeHistoryDays}
            onChange={(e) => setExcludeHistoryDays(Number(e.target.value))}
            className="flex-1 accent-[var(--accent)]"
          />
          <span className="text-sm font-bold text-[var(--accent)] w-16 text-right shrink-0">
            {excludeHistoryDays === 0 ? '不限制' : `${excludeHistoryDays} 天`}
          </span>
        </div>
        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
          <span>0（不限制）</span>
          <span>30 天</span>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="glass p-4">
        <h3 className="font-semibold mb-3">💾 数据管理</h3>
        <div className="flex flex-col gap-3">
          <button onClick={handleExport} className="btn-glass text-sm py-3">
            📤 导出数据 (JSON)
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-glass text-sm py-3">
            📥 导入数据 (JSON)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => {
              if (confirm('确定清除所有数据？此操作不可撤销！')) {
                localStorage.removeItem('cantdecide-storage')
                window.location.reload()
              }
            }}
            className="btn-glass text-sm py-3 text-red-400 hover:bg-red-500/10"
          >
            🗑️ 重置所有数据
          </button>
        </div>
      </div>

      {/* 关于 */}
      <div className="glass p-4">
        <h3 className="font-semibold mb-3">ℹ️ 关于</h3>
        <div className="text-sm text-[var(--text-secondary)] space-y-2">
          <p><strong>选不出</strong> v1.1</p>
          <p>一个解决选择困难症的趣味随机选择器</p>
          <p>支持转盘、老虎机、翻牌、一键天选四种模式</p>
          <p>支持毛玻璃和像素风双主题切换</p>
          <p>数据存储于浏览器本地，不联网</p>
          <p className="text-[var(--text-muted)] text-xs mt-3">Made with ❤️ · React + Vite + Framer Motion</p>
        </div>
      </div>
    </div>
  )
}
