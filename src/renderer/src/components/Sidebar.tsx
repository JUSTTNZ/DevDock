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
    <aside className={`sb ${collapsed ? 'sb--collapsed' : ''}`}>
      <div className="sb-header">
        {!collapsed && (
          <h1 className="sb-logo">
            <span className="sb-logo-icon">⚡</span>
            DevDock
          </h1>
        )}
        {collapsed && <span className="sb-logo-icon-only">⚡</span>}
      </div>

      <nav className="sb-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sb-item ${currentPage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
            title={collapsed ? label : undefined}
          >
            <Icon size={19} />
            {!collapsed && <span>{label}</span>}
            {currentPage === id && !collapsed && <div className="sb-item-indicator" />}
          </button>
        ))}
      </nav>

      <button
        className="sb-collapse"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        {!collapsed && <span>Collapse</span>}
      </button>

      <style>{`
        .sb {
          width: 240px;
          min-width: 240px;
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease, min-width 0.25s ease;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .sb--collapsed {
          width: 64px;
          min-width: 64px;
        }

        .sb-header {
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
          min-height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sb-logo {
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
          white-space: nowrap;
          letter-spacing: -0.3px;
        }
        .sb-logo-icon {
          font-size: 22px;
        }
        .sb-logo-icon-only {
          font-size: 22px;
        }

        .sb-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sb-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: 10px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          text-align: left;
          position: relative;
          transition: all 0.2s;
        }
        .sb--collapsed .sb-item {
          justify-content: center;
          padding: 10px;
        }
        .sb-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .sb-item.active {
          background: rgba(59, 130, 246, 0.12);
          color: var(--accent);
        }
        .sb-item-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 18px;
          border-radius: 3px 0 0 3px;
          background: var(--accent);
        }

        .sb-collapse {
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
          transition: all 0.2s;
        }
        .sb--collapsed .sb-collapse {
          justify-content: center;
          padding: 12px;
        }
        .sb-collapse:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
      `}</style>
    </aside>
  )
}
