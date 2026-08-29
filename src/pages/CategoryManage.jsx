import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { uid } from '../utils/id'

const COLORS = ['#f472b6', '#38bdf8', '#34d399', '#fbbf24', '#818cf8', '#fb923c', '#a78bfa', '#f87171']
const ICONS = ['🍔', '🎬', '🎯', '🎵', '📚', '🎮', '✈️', '💪', '🎨', '🧘', '🐱', '🌿', '☕', '🎸', '📷']

export default function CategoryManage() {
  const navigate = useNavigate()
  const categories = useStore((s) => s.categories)
  const addCategory = useStore((s) => s.addCategory)
  const deleteCategory = useStore((s) => s.deleteCategory)
  const updateCategory = useStore((s) => s.updateCategory)

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])

  const handleAdd = () => {
    if (!name.trim()) return
    addCategory({
      id: uid('cat'),
      name: name.trim(),
      icon,
      color,
      items: []
    })
    setName('')
    setIcon(ICONS[0])
    setColor(COLORS[0])
    setShowAdd(false)
  }

  const handleEdit = (cat) => {
    setEditingId(cat.id)
    setName(cat.name)
    setIcon(cat.icon)
    setColor(cat.color)
  }

  const handleSaveEdit = () => {
    if (!name.trim()) return
    updateCategory(editingId, { name: name.trim(), icon, color })
    setEditingId(null)
    setName('')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📂 类别管理</h1>
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setName(''); setIcon(ICONS[0]); setColor(COLORS[0]) }}
          className="btn-primary text-sm px-4 py-2">
          + 新建类别
        </button>
      </div>

      {/* 新建/编辑表单 */}
      <AnimatePresence>
        {(showAdd || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong p-4 flex flex-col gap-3 overflow-hidden"
          >
            <h3 className="font-semibold">{editingId ? '编辑类别' : '新建类别'}</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="类别名称"
              className="glass bg-[var(--bg-primary)] px-4 py-3 outline-none text-[var(--text-primary)] text-base rounded-[var(--radius)] border-[var(--border)] focus:border-[var(--accent)]"
              autoFocus
            />
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-2">图标</div>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((emoji) => (
                  <button key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-[var(--radius-sm)] transition-all ${
                      icon === emoji ? 'bg-[var(--accent)] scale-110' : 'glass hover:scale-105'
                    }`}
                  >{emoji}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--text-secondary)] mb-2">主题色</div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-[var(--radius-full)] transition-all ${
                      color === c ? 'ring-2 ring-white scale-110' : 'ring-1 ring-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={editingId ? handleSaveEdit : handleAdd} className="btn-primary flex-1">
                {editingId ? '保存' : '创建'}
              </button>
              <button onClick={() => { setShowAdd(false); setEditingId(null) }} className="btn-glass flex-1">
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 类别卡片网格 */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-4 flex flex-col gap-3 cursor-pointer hover:border-[var(--border-glow)] transition-all"
            onClick={() => navigate(`/category/${cat.id}`)}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{cat.icon}</span>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(cat) }}
                  className="text-xs glass px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--btn-hover)]">
                  ✏️
                </button>
                <button onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`确定删除「${cat.name}」？`)) deleteCategory(cat.id)
                }}
                  className="text-xs glass px-2 py-1 rounded-[var(--radius-sm)] hover:bg-red-500/20">
                  🗑️
                </button>
              </div>
            </div>
            <div className="font-semibold text-sm">{cat.name}</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-[var(--text-muted)]">{cat.items.length} 个选项</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
