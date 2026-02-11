import { useState, useEffect, useRef } from 'react'
import { Trash2, Terminal, ArrowDown } from 'lucide-react'
import type { Service } from '../../../shared/types'

interface LogsProps {
  services: Service[]
}

interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

const LEVEL_COLORS: Record<string, string> = {
  INFO: '#60a5fa',
  WARN: '#fbbf24',
  ERROR: '#f87171'
}

const LEVEL_BG: Record<string, string> = {
  INFO: 'rgba(96, 165, 250, 0.08)',
  WARN: 'rgba(251, 191, 36, 0.08)',
  ERROR: 'rgba(248, 113, 113, 0.08)'
}

const POLL_INTERVAL = 2000

export function Logs({ services }: LogsProps) {
  const [activeTab, setActiveTab] = useState(services[0]?.id || '')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL')
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (services.length > 0 && !services.find((s) => s.id === activeTab)) {
      setActiveTab(services[0].id)
    }
  }, [services, activeTab])

  useEffect(() => {
    if (!activeTab) return

    const fetchLogs = async () => {
      try {
        const data = await window.electronAPI.getLogs(activeTab)
        setLogs(data)
      } catch {
        setLogs([])
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [activeTab])

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const handleClear = async () => {
    if (activeTab) {
      await window.electronAPI.clearLogs(activeTab)
      setLogs([])
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(atBottom)
  }

  const activeService = services.find((s) => s.id === activeTab)
  const filteredLogs = filter === 'ALL' ? logs : logs.filter((l) => l.level === filter)

  const counts = { INFO: 0, WARN: 0, ERROR: 0 }
  for (const l of logs) counts[l.level]++

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div>
          <h2 className="logs-title">Logs</h2>
          <p className="logs-sub">
            Real-time service output
            {activeService && (
              <span className="logs-active-badge">
                <span className="logs-active-dot" style={{
                  background: activeService.status === 'running' ? 'var(--success)' : 'var(--text-muted)'
                }} />
                {activeService.name}
              </span>
            )}
          </p>
        </div>
        <div className="logs-header-actions">
          {logs.length > 0 && (
            <span className="logs-count">{logs.length} entries</span>
          )}
          {!autoScroll && (
            <button className="logs-scroll-btn" onClick={() => {
              setAutoScroll(true)
              logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }}>
              <ArrowDown size={14} />
              Scroll to bottom
            </button>
          )}
          {activeTab && logs.length > 0 && (
            <button className="logs-clear-btn" onClick={handleClear} title="Clear logs">
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="logs-empty-full">
          <Terminal size={40} strokeWidth={1} />
          <p>No services configured yet</p>
        </div>
      ) : (
        <>
          <div className="logs-tabs-row">
            <div className="logs-tabs">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  className={`logs-tab ${activeTab === svc.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(svc.id)}
                >
                  <span className="logs-tab-dot" style={{
                    background: svc.status === 'running'
                      ? 'var(--success)'
                      : svc.status === 'crashed'
                        ? 'var(--danger)'
                        : 'var(--text-muted)',
                    boxShadow: svc.status === 'running'
                      ? '0 0 6px rgba(34,197,94,0.4)'
                      : 'none'
                  }} />
                  {svc.name}
                </button>
              ))}
            </div>
            <div className="logs-filters">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((f) => (
                <button
                  key={f}
                  className={`logs-filter ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                  style={filter === f && f !== 'ALL' ? { color: LEVEL_COLORS[f], borderColor: LEVEL_COLORS[f] } : {}}
                >
                  {f}
                  {f !== 'ALL' && <span className="logs-filter-count">{counts[f]}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="logs-container" onScroll={handleScroll}>
            {filteredLogs.length === 0 ? (
              <div className="logs-empty">
                <Terminal size={24} strokeWidth={1} />
                <span>No logs yet. Start the service to see output.</span>
              </div>
            ) : (
              filteredLogs.map((entry, i) => (
                <div
                  key={i}
                  className="log-entry"
                  style={{ background: LEVEL_BG[entry.level] }}
                >
                  <span className="log-ts">{entry.timestamp}</span>
                  <span className="log-lvl" style={{ color: LEVEL_COLORS[entry.level] }}>
                    {entry.level}
                  </span>
                  <span className="log-msg">{entry.message}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logs-page { animation: fadeIn 0.3s ease-out; }

        .logs-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          animation: slideDown 0.4s ease-out;
        }
        .logs-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px 0;
        }
        .logs-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logs-active-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2px 10px 2px 6px;
          font-size: 11px;
          font-weight: 500;
        }
        .logs-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .logs-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logs-count {
          font-size: 12px;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 4px 12px;
        }
        .logs-scroll-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent);
          border: 1px solid rgba(59, 130, 246, 0.3);
          font-size: 12px;
          font-weight: 500;
        }
        .logs-clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .logs-clear-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--danger);
          color: var(--danger);
        }

        .logs-tabs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0;
          gap: 12px;
        }
        .logs-tabs {
          display: flex;
          gap: 2px;
          overflow-x: auto;
        }
        .logs-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .logs-tab:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
        .logs-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .logs-tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .logs-filters {
          display: flex;
          gap: 4px;
          padding-right: 4px;
        }
        .logs-filter {
          padding: 4px 10px;
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
          border: 1px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .logs-filter:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .logs-filter.active {
          background: var(--bg-tertiary);
          border-color: var(--border);
          color: var(--text-primary);
        }
        .logs-filter-count {
          font-size: 10px;
          opacity: 0.7;
        }

        .logs-container {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 12px 12px;
          padding: 8px;
          max-height: calc(100vh - 280px);
          overflow-y: auto;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.7;
        }

        .logs-empty {
          color: var(--text-muted);
          text-align: center;
          padding: 60px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }
        .logs-empty-full {
          color: var(--text-muted);
          text-align: center;
          padding: 80px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .logs-empty-full p { margin: 0; font-size: 14px; }

        .log-entry {
          display: flex;
          gap: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          transition: background 0.15s;
        }
        .log-entry:hover {
          background: var(--bg-hover) !important;
        }
        .log-ts {
          color: var(--text-muted);
          flex-shrink: 0;
          font-size: 11px;
          opacity: 0.7;
        }
        .log-lvl {
          font-weight: 700;
          flex-shrink: 0;
          min-width: 44px;
          font-size: 11px;
        }
        .log-msg {
          color: var(--text-primary);
          word-break: break-word;
        }
      `}</style>
    </div>
  )
}
