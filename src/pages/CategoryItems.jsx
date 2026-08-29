import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { uid } from '../utils/id'

export default function CategoryItems() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categories = useStore((s) => s.categories)
  const addItem = useStore((s) => s.addItem)
  const updateItem = useStore((s) => s.updateItem)
  const deleteItem = useStore((s) => s.deleteItem)

  const cat = categories.find((c) => c.id === id)

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [itemName, setItemName] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemWeight, setItemWeight] = useState(5)

  if (!cat) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">😕</p>
        <p className="text-[var(--text-muted)]">类别不存在</p>
        <button onClick={() => navigate('/categories')} className="btn-primary mt-4">返回类别管理</button>
      </div>
    )
  }

  const resetForm = () => {
    setItemName('')
    setItemDesc('')
    setItemWeight(5)
    setEditingId(null)
    setShowAdd(false)
  }

  const handleAdd = () => {
    if (!itemName.trim()) return
    addItem(cat.id, {
      id: uid('item'),
      name: itemName.trim(),
      desc: itemDesc.trim(),
      weight: itemWeight
    })
    resetForm()
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setItemName(item.name)
    setItemDesc(item.desc || '')
    setItemWeight(item.weight || 5)
    setShowAdd(true)
  }

  const handleSaveEdit = () => {
    if (!itemName.trim()) return
    updateItem(cat.id, editingId, {
      name: itemName.trim(),
      desc: itemDesc.trim(),
      weight: itemWeight
    })
    resetForm()
  }

  const handleBatchImport = () => {
    const text = prompt('粘贴选项（每行一个，或用逗号分隔）：')
    if (!text) return
    const names = text.split(/[\n,，]/).map((s) => s.trim()).filter(Boolean)
    names.forEach((name) => {
      addItem(cat.id, {
        id: uid('item'),
        name,
        desc: '',
        weight: 5
      })
    })
  }

  // 权重分布可视化
  const totalWeight = cat.items.reduce((s, i) => s + (i.weight || 5), 0) || 1
  const maxWeight = Math.max(...cat.items.map((i) => i.weight || 5), 1)

  return (
    <div className="flex flex-col gap-5">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/categories')} className="text-2xl glass w-10 h-10 flex items-center justify-center rounded-[var(--radius)]">
          ←
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{cat.icon}</span>
            <h1 className="text-xl font-bold">{cat.name}</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{cat.items.length} 个选项</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button onClick={() => { setShowAdd(!showAdd); resetForm() }}
          className="btn-primary text-sm px-4 py-2 flex-1">
          + 添加选项
        </button>
        <button onClick={handleBatchImport}
          className="btn-glass text-sm px-4 py-2">
          📋 批量导入
        </button>
      </div>

      {/* 新建/编辑表单 */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong p-4 flex flex-col gap-3 overflow-hidden"
          >
            <h3 className="font-semibold">{editingId ? '编辑选项' : '添加选项'}</h3>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="选项名称"
              className="glass bg-[var(--bg-primary)] px-4 py-3 outline-none text-[var(--text-primary)] text-base rounded-[var(--radius)] border-[var(--border)] focus:border-[var(--accent)]"
              autoFocus
            />
            <input
              type="text"
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="描述/备注（可选）"
              className="glass bg-[var(--bg-primary)] px-4 py-3 outline-none text-[var(--text-primary)] text-base rounded-[var(--radius)] border-[var(--border)] focus:border-[var(--accent)]"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)]">权重</span>
                <span className="text-sm font-bold text-[var(--accent)]">{itemWeight}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={itemWeight}
                onChange={(e) => setItemWeight(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>低概率</span>
                <span>高概率</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={editingId ? handleSaveEdit : handleAdd} className="btn-primary flex-1">
                {editingId ? '保存' : '添加'}
              </button>
              <button onClick={resetForm} className="btn-glass flex-1">取消</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 权重分布概览 */}
      {cat.items.length > 0 && (
        <div className="glass px-4 py-3">
          <div className="text-xs text-[var(--text-muted)] mb-2">概率分布预览</div>
          <div className="flex gap-1 h-6 items-end">
            {cat.items.map((item) => (
              <div key={item.id} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${((item.weight || 5) / maxWeight) * 20}px`,
                    backgroundColor: cat.color,
                    opacity: 0.4 + ((item.weight || 5) / maxWeight) * 0.6
                  }}
                />
              </div>
            ))}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1 text-right">
            {cat.items.map((item) => `${item.name} ${Math.round(((item.weight || 5) / totalWeight) * 100)}%`).join(' · ')}
          </div>
        </div>
      )}

      {/* 选项列表 */}
      <AnimatePresence>
        {cat.items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass px-4 py-3 flex items-center gap-3"
          >
            {/* 权重指示条 */}
            <div className="w-2 self-stretch rounded-full shrink-0"
              style={{
                backgroundColor: cat.color,
                opacity: 0.3 + ((item.weight || 5) / maxWeight) * 0.7
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{item.name}</div>
              {item.desc && (
                <div className="text-xs text-[var(--text-muted)] truncate">{item.desc}</div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-[var(--text-muted)] w-6 text-center">
                {Math.round(((item.weight || 5) / totalWeight) * 100)}%
              </span>
              <button onClick={() => handleEdit(item)}
                className="text-xs glass px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--btn-hover)]">
                ✏️
              </button>
              <button onClick={() => deleteItem(cat.id, item.id)}
                className="text-xs glass px-2 py-1 rounded-[var(--radius-sm)] hover:bg-red-500/20">
                🗑️
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {cat.items.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p className="text-4xl mb-2">📭</p>
          <p>还没有选项，点击上方按钮添加</p>
        </div>
      )}
    </div>
  )
}
