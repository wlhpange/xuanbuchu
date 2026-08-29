import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { uid } from '../utils/id'

export default function History() {
  const navigate = useNavigate()
  const history = useStore((s) => s.history)
  const categories = useStore((s) => s.categories)
  const clearHistory = useStore((s) => s.clearHistory)
  const clearHistoryByDate = useStore((s) => s.clearHistoryByDate)
  const pickRandom = useStore((s) => s.pickRandom)
  const addHistory = useStore((s) => s.addHistory)

  const [filterId, setFilterId] = useState('all')
  const [rerollResult, setRerollResult] = useState(null)

  const filtered = useMemo(() => {
    if (filterId === 'all') return history
    return history.filter((h) => h.categoryId === filterId)
  }, [history, filterId])

  const handleReroll = (catId) => {
    const cat = categories.find((c) => c.id === catId)
    const result = pickRandom(catId, [])
    if (result && cat) {
      addHistory(catId, result.id, result.name, cat.name)
      setRerollResult({ name: result.name, catName: cat.name, id: uid('reroll') })
      setTimeout(() => setRerollResult(null), 3000)
    }
  }

  // 按日期分组
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach((h) => {
      const date = new Date(h.timestamp)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      if (!groups[key]) groups[key] = []
      groups[key].push(h)
    })
    return groups
  }, [filtered])

  const groupKeys = Object.keys(grouped)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📋 历史记录</h1>
        {filtered.length > 0 && (
          <button onClick={() => {
            if (confirm('确定清空所有历史记录？')) clearHistory()
          }}
            className="text-sm glass px-3 py-1.5 rounded-[var(--radius)] text-red-400 hover:bg-red-500/10">
            清空全部
          </button>
        )}
      </div>

      {/* 类别筛选 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <button
          onClick={() => setFilterId('all')}
          className={`px-3 py-1.5 rounded-[var(--radius)] text-sm whitespace-nowrap shrink-0 ${
            filterId === 'all' ? 'btn-primary' : 'glass'
          }`}
        >
          全部 ({history.length})
        </button>
        {categories.map((cat) => {
          const count = history.filter((h) => h.categoryId === cat.id).length
          return count > 0 ? (
            <button
              key={cat.id}
              onClick={() => setFilterId(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius)] text-sm whitespace-nowrap shrink-0 ${
                filterId === cat.id ? 'btn-primary' : 'glass'
              }`}
            >
              {cat.icon} {cat.name} ({count})
            </button>
          ) : null
        })}
      </div>

      {/* 一键再选结果提示 */}
      <AnimatePresence>
        {rerollResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-strong p-3 text-center text-sm"
          >
            🎉 再次选中「<span className="font-bold">{rerollResult.name}</span>」
            — 已加入历史
          </motion.div>
        )}
      </AnimatePresence>

      {/* 按日期分组展示 */}
      {groupKeys.length === 0 && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-lg">还没有选择记录</p>
          <p className="text-sm mt-1">去首页开始选择吧！</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">开始选择</button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {groupKeys.map((date) => (
          <div key={date}>
            <div className="text-xs text-[var(--text-muted)] mb-2 ml-1">
              {date}
              <button
                onClick={() => {
                  if (confirm(`确定清空 ${date} 的历史记录？`)) {
                    clearHistoryByDate(date, filterId !== 'all' ? filterId : undefined)
                  }
                }}
                className="ml-2 text-[var(--accent)]"
              >
                清空当天
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {grouped[date].map((h) => {
                const cat = categories.find((c) => c.id === h.categoryId)
                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass px-4 py-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">{cat?.icon || '📌'}</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{h.itemName}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {h.categoryName} · {new Date(h.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReroll(h.categoryId)}
                      className="text-xs glass px-2.5 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--btn-hover)] shrink-0 ml-2"
                    >
                      🔄 再选
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
