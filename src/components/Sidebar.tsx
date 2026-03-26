import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Search,
  Bell,
  BarChart3,
} from 'lucide-react'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Overview'  },
  { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/clienti',   icon: Users,           label: 'Clienti'    },
  { to: '/pipeline',  icon: Kanban,          label: 'Pipeline'   },
  { to: '/attivita',  icon: CheckSquare,     label: 'Attività'   },
]

export function Sidebar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-surface)]/90 backdrop-blur-xl border-b border-[var(--bg-border)] px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <span className="text-xl font-bold italic text-[var(--bg-base)]">S</span>
          </div>
          <span className="hidden sm:block font-bold text-xl tracking-tight text-[var(--text-primary)]">MiniCRM</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--bg-border)]">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--bg-base)] shadow-md shadow-[var(--accent)]/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition border border-transparent hover:border-[var(--bg-border)]">
            <Search size={20} />
          </button>
          <button className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition relative border border-transparent hover:border-[var(--bg-border)]">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-surface)]"></span>
          </button>
          
          <div className="flex items-center gap-2 pl-3 border-l border-[var(--bg-border)] ml-2">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] overflow-hidden cursor-pointer border-2 border-transparent hover:border-[var(--accent)] transition ring-1 ring-[var(--bg-border)]">
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=B8FF2B&textColor=0B0D0F&fontWeight=900" alt="Avatar" />
            </div>
            <div className="hidden lg:block text-left cursor-pointer">
              <p className="text-sm font-bold leading-tight text-[var(--text-primary)]">Jelly Grar</p>
              <p className="text-[10px] text-[var(--accent)] font-semibold">Pro Plan</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
