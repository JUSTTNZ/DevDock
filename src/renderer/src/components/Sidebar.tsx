import { useState, useEffect } from 'react'
import { LayoutDashboard, Server, ScrollText, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

export type Page = 'dashboard' | 'services' | 'logs' | 'settings'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'services', label: 'Services', icon: Server },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings }
]

const STORAGE_KEY = 'devdock-sidebar-collapsed'

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <h1 className="sidebar-logo">
            <span className="logo-icon">⚡</span>
            DevDock
          </h1>
        )}
        {collapsed && <span className="logo-icon-only">⚡</span>}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${currentPage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
            title={collapsed ? label : undefined}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <button
        className="collapse-toggle"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span>Collapse</span>}
      </button>

      <style>{`
        .sidebar {
          width: 240px;
          min-width: 240px;
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease, min-width 0.2s ease;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .sidebar.collapsed {
          width: 64px;
          min-width: 64px;
        }

        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
          min-height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-logo {
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .logo-icon {
          font-size: 24px;
        }

        .logo-icon-only {
          font-size: 24px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          text-align: left;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 10px;
        }

        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent);
        }

        .collapse-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          margin: 8px;
          border-radius: 8px;
          background: transparent;
          color: var(--text-muted);
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
        }

        .sidebar.collapsed .collapse-toggle {
          justify-content: center;
          padding: 12px;
        }

        .collapse-toggle:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
      `}</style>
    </aside>
  )
}
