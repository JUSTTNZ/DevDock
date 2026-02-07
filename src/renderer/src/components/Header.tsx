import { Plus, RefreshCw, Activity, Square, AlertTriangle } from 'lucide-react'

interface HeaderProps {
  onAddService: () => void
  onRefresh: () => void
  stats: {
    running: number
    stopped: number
    crashed: number
  }
}

export function Header({ onAddService, onRefresh, stats }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="logo">
            <span className="logo-icon">⚡</span>
            DevDock
          </h1>
          <div className="stats">
            <div className="stat running">
              <Activity size={14} />
              <span>{stats.running} running</span>
            </div>
            <div className="stat stopped">
              <Square size={14} />
              <span>{stats.stopped} stopped</span>
            </div>
            {stats.crashed > 0 && (
              <div className="stat crashed">
                <AlertTriangle size={14} />
                <span>{stats.crashed} crashed</span>
              </div>
            )}
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={onRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary" onClick={onAddService}>
            <Plus size={16} />
            Add Service
          </button>
        </div>
      </div>

      <style>{`
        .header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 16px 24px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }

        .logo-icon {
          font-size: 28px;
        }

        .stats {
          display: flex;
          gap: 16px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border-radius: 20px;
        }

        .stat.running {
          color: var(--success);
        }

        .stat.stopped {
          color: var(--text-muted);
        }

        .stat.crashed {
          color: var(--danger);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
        }

        .btn-primary {
          background: var(--accent);
          color: white;
        }

        .btn-primary:hover {
          background: var(--accent-hover);
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
      `}</style>
    </header>
  )
}
