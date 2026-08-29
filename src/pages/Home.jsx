import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

const MODES = [
  { key: 'wheel', icon: '🎡', label: '命运转盘' },
  { key: 'slot', icon: '🎰', label: '老虎机' },
  { key: 'card', icon: '🃏', label: '翻牌' },
  { key: 'blast', icon: '⚡', label: '一键天选' },
]

export default function Home() {
  const navigate = useNavigate()
  const categories = useStore((s) => s.categories)
  const history = useStore((s) => s.history)
  const pickRandom = useStore((s) => s.pickRandom)
  const pickMultiple = useStore((s) => s.pickMultiple)
  const addHistory = useStore((s) => s.addHistory)

  const [activeCat, setActiveCat] = useState(categories[0]?.id || null)
  const [mode, setMode] = useState('blast')
  const [multiCount, setMultiCount] = useState(1)
  const [results, setResults] = useState(null)
  const [excludeIds, setExcludeIds] = useState([])
  const [isRolling, setIsRolling] = useState(false)
  const [cardState, setCardState] = useState({ flipped: [], revealed: false })
  const [slotCols, setSlotCols] = useState([null, null, null])
  const [slotStopped, setSlotStopped] = useState([false, false, false])
  const [wheelAngle, setWheelAngle] = useState(0)

  const cat = categories.find((c) => c.id === activeCat)
  const items = useMemo(() => cat?.items || [], [cat])

  // 最近使用
  const recentCats = [...categories].sort((a, b) => {
    const aRecent = history.find((h) => h.categoryId === a.id)
    const bRecent = history.find((h) => h.categoryId === b.id)
    return (bRecent?.timestamp || 0) - (aRecent?.timestamp || 0)
  })

  const doPick = useCallback(() => {
    if (!activeCat || items.length === 0 || isRolling) return
    setIsRolling(true)
    setResults(null)
    setCardState({ flipped: [], revealed: false })

    if (mode === 'blast') {
      // 一键天选 - 屏幕闪动后出结果
      setTimeout(() => {
        const result = multiCount > 1
          ? pickMultiple(activeCat, multiCount)
          : [pickRandom(activeCat, excludeIds)].filter(Boolean)
        if (result.length > 0) {
          setResults(result)
          result.forEach((r) => addHistory(activeCat, r.id, r.name, cat?.name || ''))
        }
        setIsRolling(false)
      }, 800)
    } else if (mode === 'slot') {
      // 老虎机 - 三列依次定格
      const randomItem = () => items[Math.floor(Math.random() * items.length)]
      const stopped = [false, false, false]
      setSlotStopped([false, false, false])
      setSlotCols(Array.from({ length: 3 }, randomItem))

      const timer = setInterval(() => {
        setSlotCols((prev) => {
          if (prev.length === 0) return prev
          return prev.map((item, i) => (stopped[i] ? item : randomItem()))
        })
      }, 100)

      const stopCols = [600, 1200, 2000]
      stopCols.forEach((delay, i) => {
        setTimeout(() => {
          stopped[i] = true
          setSlotStopped((prev) => {
            const next = [...prev]
            next[i] = true
            return next
          })
          setSlotCols((prev) => {
            const next = [...prev]
            next[i] = randomItem()
            return next
          })
          if (i === stopCols.length - 1) {
            clearInterval(timer)
            const result = pickRandom(activeCat, excludeIds) || randomItem()
            setSlotCols((prev) => {
              const next = [...prev]
              next[2] = result
              return next
            })
            setResults([result])
            addHistory(activeCat, result.id, result.name, cat?.name || '')
            setIsRolling(false)
          }
        }, delay)
      })
    } else if (mode === 'card') {
      // 翻牌 - 三张牌 选一张翻开
      const candidates = Array.from({ length: 3 }, () => {
        const result = pickRandom(activeCat, excludeIds)
        return result || items[Math.floor(Math.random() * items.length)]
      })
      setSlotCols(candidates)
      // 用户点击卡牌来翻开
      setTimeout(() => setIsRolling(false), 300)
    } else if (mode === 'wheel') {
      // 命运转盘动画
      const spins = 5 + Math.random() * 5
      const angle = spins * 360
      setWheelAngle((prev) => prev + angle)

      setTimeout(() => {
        const result = multiCount > 1
          ? pickMultiple(activeCat, multiCount)
          : [pickRandom(activeCat, excludeIds)].filter(Boolean)
        if (result.length > 0) {
          setResults(result)
          result.forEach((r) => addHistory(activeCat, r.id, r.name, cat?.name || ''))
        }
        setIsRolling(false)
      }, 3000)
    }
  }, [activeCat, items, isRolling, mode, multiCount, excludeIds, pickRandom, pickMultiple, addHistory, cat])

  const handleCardFlip = (idx) => {
    if (cardState.revealed) return
    const flipped = [...cardState.flipped, idx]
    setCardState({ flipped, revealed: true })
    const picked = slotCols[idx]
    if (picked) {
      setResults([picked])
      addHistory(activeCat, picked.id, picked.name, cat?.name || '')
    }
  }

  const handleReroll = () => {
    setExcludeIds([])
    setResults(null)
    doPick()
  }

  const handleExclude = () => {
    if (results && results.length > 0) {
      const newExclude = [...excludeIds, ...results.map((r) => r.id)].slice(-5)
      setExcludeIds(newExclude)
      setResults(null)
      // 重新抽取
      setTimeout(() => {
        const result = multiCount > 1
          ? pickMultiple(activeCat, multiCount)
          : [pickRandom(activeCat, [...newExclude])].filter(Boolean)
        if (result.length > 0) {
          setResults(result)
          result.forEach((r) => addHistory(activeCat, r.id, r.name, cat?.name || ''))
        }
      }, 100)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          ✨ 选不出
        </h1>
        <p className="text-sm opacity-60">交给命运，别纠结了</p>
      </div>

      {/* 类别选择 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
        {recentCats.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveCat(c.id); setResults(null); setExcludeIds([]) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius)] whitespace-nowrap transition-all text-sm font-medium border shrink-0 ${
              activeCat === c.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/20 text-white'
                : 'border-[var(--border)] glass text-[var(--text-secondary)]'
            }`}
          >
            <span>{c.icon}</span>
            {c.name}
          </button>
        ))}
        <button
          onClick={() => navigate('/categories')}
          className="flex items-center gap-1 px-3 py-2 rounded-[var(--radius)] whitespace-nowrap text-sm glass border-[var(--border)] text-[var(--text-muted)] shrink-0"
        >
          + 管理
        </button>
      </div>

      {/* 当前类别信息 */}
      {cat && (
        <div className="flex items-center justify-between glass px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cat.icon}</span>
            <div>
              <div className="font-semibold">{cat.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{items.length} 个选项</div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/category/${cat.id}`)}
            className="text-sm text-[var(--accent)]"
          >
            编辑
          </button>
        </div>
      )}

      {/* 随机模式选择 */}
      <div className="grid grid-cols-4 gap-2">
        {MODES.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setResults(null); setExcludeIds([]); setCardState({ flipped: [], revealed: false }) }}
            className={`flex flex-col items-center gap-1 py-3 rounded-[var(--radius)] transition-all text-xs ${
              mode === key
                ? 'glass-strong border-[var(--border-glow)]'
                : 'glass opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-2xl">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 多选数量 */}
      <div className="flex items-center gap-3 glass px-4 py-3">
        <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">抽取数量</span>
        <input
          type="range"
          min="1"
          max={Math.min(10, items.length)}
          value={multiCount}
          onChange={(e) => { setMultiCount(Number(e.target.value)); setResults(null) }}
          className="flex-1 accent-[var(--accent)]"
        />
        <span className="text-sm font-bold text-[var(--accent)] w-6 text-right">{multiCount}</span>
      </div>

      {/* 结果展示区 */}
      <AnimatePresence mode="wait">
        {mode === 'wheel' && (isRolling || results) && (
          <WheelDisplay items={items} angle={wheelAngle} isRolling={isRolling} />
        )}
        {mode === 'slot' && (isRolling || results) && (
          <SlotDisplay cols={slotCols} stopped={slotStopped} icon={cat?.icon} />
        )}
        {mode === 'card' && slotCols.length > 0 && (
          <CardDisplay
            candidates={slotCols}
            flipped={cardState.flipped}
            revealed={cardState.revealed}
            onFlip={handleCardFlip}
          />
        )}
      </AnimatePresence>

      {results && mode !== 'card' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {results.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="glass-strong p-5 text-center"
            >
              <div className="text-4xl mb-2">
                {cat?.icon || '🎉'}
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: cat?.color || 'var(--text-primary)' }}>
                {r.name}
              </div>
              {r.desc && (
                <div className="text-sm text-[var(--text-secondary)]">{r.desc}</div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {results && mode === 'card' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong p-5 text-center"
        >
          <div className="text-4xl mb-2">{cat?.icon || '🎉'}</div>
          <div className="text-2xl font-bold mb-1" style={{ color: cat?.color || 'var(--text-primary)' }}>
            {results[0]?.name}
          </div>
          {results[0]?.desc && (
            <div className="text-sm text-[var(--text-secondary)]">{results[0]?.desc}</div>
          )}
        </motion.div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {!isRolling && !results && (
          <button
            onClick={doPick}
            disabled={!activeCat || items.length === 0}
            className="btn-primary flex-1 text-lg py-4 disabled:opacity-30"
          >
            开始选择
          </button>
        )}
        {results && (
          <>
            <button onClick={handleReroll} className="btn-glass flex-1 py-3">
              🔄 再来一次
            </button>
            <button onClick={handleExclude} className="btn-glass flex-1 py-3">
              👎 不满意换一个
            </button>
          </>
        )}
        {isRolling && mode !== 'card' && (
          <div className="flex-1 glass py-4 text-center text-[var(--text-muted)]">
            命运正在抉择中...
          </div>
        )}
      </div>

      {/* 排除提示 */}
      {excludeIds.length > 0 && (
        <div className="text-xs text-[var(--text-muted)] text-center">
          已排除最近 {excludeIds.length} 个结果，点击「再来一次」重置
        </div>
      )}
    </div>
  )
}

/* ---- 命运转盘 ---- */
function WheelDisplay({ items, angle, isRolling }) {
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4']
  const n = items.length
  const slice = 360 / n

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ rotate: angle }}
        transition={isRolling ? { duration: 3, ease: [0.15, 0.85, 0.3, 1] } : { duration: 0 }}
        className="relative w-64 h-64"
      >
        {/* 指针 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
        </div>
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {items.map((item, i) => {
            const startAngle = i * slice
            const endAngle = startAngle + slice
            const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180)
            const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180)
            const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180)
            const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180)
            const largeArc = slice > 180 ? 1 : 0
            return (
              <g key={i}>
                <path
                  d={`M100,100 L${x1},${y1} A90,90 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={colors[i % colors.length]}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
                <text
                  x={100 + 65 * Math.cos(((startAngle + slice / 2) * Math.PI) / 180)}
                  y={100 + 65 * Math.sin(((startAngle + slice / 2) * Math.PI) / 180)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  transform={`rotate(${startAngle + slice / 2 + 90}, ${100 + 65 * Math.cos(((startAngle + slice / 2) * Math.PI) / 180)}, ${100 + 65 * Math.sin(((startAngle + slice / 2) * Math.PI) / 180)})`}
                >
                  {item.name.length > 4 ? item.name.slice(0, 4) + '...' : item.name}
                </text>
              </g>
            )
          })}
          <circle cx="100" cy="100" r="12" fill="white" opacity="0.9" />
        </svg>
      </motion.div>
    </div>
  )
}

/* ---- 老虎机 ---- */
function SlotDisplay({ cols, stopped, icon }) {
  return (
    <div className="flex gap-3 justify-center">
      {cols.map((item, i) => (
        <motion.div
          key={i}
          animate={stopped?.[i] ? { scale: [1, 1.1, 1] } : { y: [0, -10, 0] }}
          transition={stopped?.[i] ? { duration: 0.5, delay: i * 0.3 } : { repeat: Infinity, duration: 0.15 }}
          className="glass-strong w-24 h-32 flex flex-col items-center justify-center overflow-hidden"
        >
          {item ? (
            <>
              <span className="text-3xl mb-1">{icon || '🎲'}</span>
              <span className="text-sm font-bold text-center px-1">{item.name}</span>
            </>
          ) : (
            <span className="text-3xl opacity-30">❓</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

/* ---- 翻牌 ---- */
function CardDisplay({ candidates, flipped, revealed, onFlip }) {
  return (
    <div className="flex gap-4 justify-center">
      {candidates.map((item, i) => (
        <motion.button
          key={i}
          onClick={() => onFlip(i)}
          disabled={revealed}
          whileHover={!revealed ? { scale: 1.05 } : {}}
          whileTap={!revealed ? { scale: 0.95 } : {}}
          className={`w-24 h-36 rounded-[var(--radius)] flex items-center justify-center transition-all ${
            flipped.includes(i)
              ? 'glass-strong border-[var(--border-glow)]'
              : 'btn-primary cursor-pointer'
          }`}
        >
          {flipped.includes(i) ? (
            <div className="text-center">
              <div className="text-3xl mb-1">{['🎁','🎪','🎯'][i]}</div>
              <div className="text-sm font-bold">{item.name}</div>
            </div>
          ) : (
            <motion.span
              animate={{ rotateY: [0, 180] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="text-4xl"
            >
              ❓
            </motion.span>
          )}
        </motion.button>
      ))}
    </div>
  )
}
