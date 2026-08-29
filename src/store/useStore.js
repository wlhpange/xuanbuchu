import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../utils/id'

const DEFAULT_CATEGORIES = [
  {
    id: 'eat',
    name: '今天吃什么',
    icon: '🍔',
    color: '#f472b6',
    items: [
      { id: 'e1', name: '火锅', desc: '涮涮涮，越吃越有', weight: 10 },
      { id: 'e2', name: '日料', desc: '新鲜刺身，清爽美味', weight: 8 },
      { id: 'e3', name: '粤菜', desc: '清淡精致，早茶文化', weight: 7 },
      { id: 'e4', name: '烤肉', desc: '滋滋作响，香气四溢', weight: 9 },
      { id: 'e5', name: '麻辣烫', desc: '一人食也精彩', weight: 8 },
      { id: 'e6', name: '披萨', desc: '芝士就是力量', weight: 6 },
      { id: 'e7', name: '沙拉', desc: '轻食健康无负担', weight: 4 },
      { id: 'e8', name: '拉面', desc: '浓郁汤底，劲道面条', weight: 7 },
      { id: 'e9', name: '炸鸡', desc: '酥脆多汁，罪恶美食', weight: 6 },
      { id: 'e10', name: '螺蛳粉', desc: '酸辣鲜爽，欲罢不能', weight: 5 },
    ]
  },
  {
    id: 'watch',
    name: '今天看什么',
    icon: '🎬',
    color: '#38bdf8',
    items: [
      { id: 'w1', name: '科幻电影', desc: '探索未知，脑洞大开', weight: 8 },
      { id: 'w2', name: '悬疑剧集', desc: '层层反转，烧脑推理', weight: 9 },
      { id: 'w3', name: '动画电影', desc: '治愈温暖，画面唯美', weight: 7 },
      { id: 'w4', name: '纪录片', desc: '真实世界，震撼人心', weight: 6 },
      { id: 'w5', name: '综艺节目', desc: '轻松搞笑，下饭神器', weight: 8 },
      { id: 'w6', name: '爱情喜剧', desc: '甜蜜浪漫，心情愉悦', weight: 5 },
    ]
  },
  {
    id: 'play',
    name: '周末去哪玩',
    icon: '🎯',
    color: '#34d399',
    items: [
      { id: 'p1', name: '爬山', desc: '亲近自然，登高望远', weight: 8 },
      { id: 'p2', name: '看展', desc: '艺术熏陶，拍照打卡', weight: 7 },
      { id: 'p3', name: '逛街', desc: '买买买，治愈一切', weight: 6 },
      { id: 'p4', name: '露营', desc: '星空篝火，远离喧嚣', weight: 7 },
      { id: 'p5', name: '剧本杀', desc: '沉浸推理，社交新方式', weight: 9 },
      { id: 'p6', name: '宅家', desc: '躺平也是种快乐', weight: 10 },
    ]
  },
  {
    id: 'listen',
    name: '听什么',
    icon: '🎵',
    color: '#fbbf24',
    items: [
      { id: 'l1', name: '华语流行', desc: '抖音热歌，洗脑循环', weight: 8 },
      { id: 'l2', name: '爵士乐', desc: '慵懒午后，咖啡伴侣', weight: 6 },
      { id: 'l3', name: '电子音乐', desc: '氛围律动，专注力MAX', weight: 7 },
      { id: 'l4', name: '播客', desc: '涨知识，听故事', weight: 8 },
      { id: 'l5', name: '白噪音', desc: '雨声海浪，助眠放松', weight: 5 },
      { id: 'l6', name: '经典老歌', desc: '怀旧金曲，回忆满满', weight: 6 },
    ]
  }
]

export const useStore = create(
  persist(
    (set, get) => ({
      // ---- 主题 ----
      theme: 'glass',

      // ---- 类别 ----
      categories: DEFAULT_CATEGORIES,

      // ---- 历史记录 ----
      history: [],

      // ---- 设置 ----
      excludeHistoryDays: 7, // 近N天内不重复

      // === 主题操作 ===
      setTheme: (theme) => set({ theme }),
      setExcludeHistoryDays: (days) => set({ excludeHistoryDays: days }),

      // === 类别操作 ===
      addCategory: (cat) =>
        set((s) => ({ categories: [...s.categories, cat] })),

      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      // === 选项操作 ===
      addItem: (catId, item) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId ? { ...c, items: [...c.items, item] } : c
          ),
        })),

      updateItem: (catId, itemId, updates) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId
              ? {
                  ...c,
                  items: c.items.map((i) =>
                    i.id === itemId ? { ...i, ...updates } : i
                  ),
                }
              : c
          ),
        })),

      deleteItem: (catId, itemId) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === catId
              ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
              : c
          ),
        })),

      // === 随机选择（带排除和历史降权） ===
      pickRandom: (categoryId, excludeIds = []) => {
        const cat = get().categories.find((c) => c.id === categoryId)
        if (!cat || cat.items.length === 0) return null

        const days = get().excludeHistoryDays
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

        // 计算每个选项的最终权重
        const items = cat.items.map((item) => {
          if (excludeIds.includes(item.id)) return { ...item, finalWeight: 0 }

          // 历史降权
          const recentPicks = get().history.filter(
            (h) =>
              h.categoryId === categoryId &&
              h.itemId === item.id &&
              h.timestamp > cutoff
          )

          let cooldown = 1
          if (recentPicks.length > 0) {
            const latest = Math.max(...recentPicks.map((h) => h.timestamp))
            const daysSince = (Date.now() - latest) / (24 * 60 * 60 * 1000)
            cooldown = Math.max(0.1, 1 - daysSince / days)
          }

          return { ...item, finalWeight: (item.weight || 5) * cooldown }
        })

        const validItems = items.filter((i) => i.finalWeight > 0)
        if (validItems.length === 0) return null

        // 加权随机
        const totalWeight = validItems.reduce((s, i) => s + i.finalWeight, 0)
        let rand = Math.random() * totalWeight
        for (const item of validItems) {
          rand -= item.finalWeight
          if (rand <= 0) return item
        }
        return validItems[validItems.length - 1]
      },

      // === 多选模式 ===
      pickMultiple: (categoryId, count) => {
        const results = []
        const exclude = []
        for (let i = 0; i < count; i++) {
          const picked = get().pickRandom(categoryId, exclude)
          if (!picked) break
          results.push(picked)
          exclude.push(picked.id)
        }
        return results
      },

      // === 历史操作 ===
      addHistory: (categoryId, itemId, itemName, categoryName) =>
        set((s) => ({
          history: [
            {
              id: uid('h'),
              categoryId,
              itemId,
              itemName,
              categoryName,
              timestamp: Date.now(),
            },
            ...s.history,
          ].slice(0, 500), // 最多保留 500 条
        })),

      clearHistory: () => set({ history: [] }),
      clearHistoryByCategory: (catId) =>
        set((s) => ({
          history: s.history.filter((h) => h.categoryId !== catId),
        })),
      clearHistoryByDate: (dateKey, catId) =>
        set((s) => ({
          history: s.history.filter((h) => {
            const matchesCat = !catId || h.categoryId === catId
            if (!matchesCat) return true
            const d = new Date(h.timestamp)
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
            return key !== dateKey
          }),
        })),

      // === 数据导入导出 ===
      exportData: () => ({
        categories: get().categories,
        history: get().history,
        theme: get().theme,
        exportedAt: new Date().toISOString(),
      }),

      importData: (data) => {
        if (data.categories) set({ categories: data.categories })
        if (data.history) set({ history: data.history })
        if (data.theme) set({ theme: data.theme })
      },
    }),
    {
      name: 'cantdecide-storage',
    }
  )
)
