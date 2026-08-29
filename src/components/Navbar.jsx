import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', icon: '🎲', label: '选择' },
  { to: '/categories', icon: '📂', label: '类别' },
  { to: '/history', icon: '📋', label: '记录' },
  { to: '/settings', icon: '⚙️', label: '设置' },
]

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass max-w-lg mx-auto rounded-b-none border-b-0 flex justify-around py-3 px-2">
        {tabs.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1 rounded-[var(--radius)] transition-all duration-200 no-underline ${
                isActive
                  ? 'text-[var(--accent)] scale-110'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
