import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store/useStore'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CategoryManage from './pages/CategoryManage'
import CategoryItems from './pages/CategoryItems'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="bg-animated min-h-dvh flex flex-col">
      <main className="flex-1 pb-24 max-w-lg mx-auto w-full px-4 pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<CategoryManage />} />
          <Route path="/category/:id" element={<CategoryItems />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Navbar />
    </div>
  )
}
