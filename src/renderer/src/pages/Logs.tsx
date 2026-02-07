import { useState } from 'react'
import type { Service } from '../../../shared/types'

interface LogsProps {
  services: Service[]
}

interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

const MOCK_LOGS: Record<string, LogEntry[]> = {
  'service-1': [
    { timestamp: '2025-01-15 10:23:01', level: 'INFO', message: 'Server started on port 3001' },
    { timestamp: '2025-01-15 10:23:02', level: 'INFO', message: 'Connected to database' },
    { timestamp: '2025-01-15 10:24:15', level: 'WARN', message: 'Slow query detected: GET /api/users took 1200ms' },
    { timestamp: '2025-01-15 10:25:30', level: 'INFO', message: 'Request: POST /api/auth/login - 200 OK' },
    { timestamp: '2025-01-15 10:26:00', level: 'ERROR', message: 'Failed to send email notification: SMTP timeout' },
    { timestamp: '2025-01-15 10:27:12', level: 'INFO', message: 'Request: GET /api/services - 200 OK' },
    { timestamp: '2025-01-15 10:28:45', level: 'INFO', message: 'Cache refreshed successfully' }
  ],
  'service-2': [
    { timestamp: '2025-01-15 10:30:00', level: 'INFO', message: 'Webpack compiled successfully' },
    { timestamp: '2025-01-15 10:30:01', level: 'INFO', message: 'Development server running at http://localhost:3000' },
    { timestamp: '2025-01-15 10:31:22', level: 'WARN', message: 'Large bundle size: main.js is 2.4MB' },
    { timestamp: '2025-01-15 10:32:10', level: 'INFO', message: 'Hot module replacement active' },
    { timestamp: '2025-01-15 10:33:05', level: 'INFO', message: 'Recompiled in 340ms' }
  ],
  'service-3': [
    { timestamp: '2025-01-15 09:00:00', level: 'INFO', message: 'PostgreSQL server starting' },
    { timestamp: '2025-01-15 09:00:02', level: 'INFO', message: 'Listening on port 5432' },
    { timestamp: '2025-01-15 09:15:30', level: 'WARN', message: 'Connection pool nearing limit: 45/50' },
    { timestamp: '2025-01-15 09:20:00', level: 'ERROR', message: 'Too many connections: rejecting new connection' },
    { timestamp: '2025-01-15 09:20:05', level: 'INFO', message: 'Server stopped by user' }
  ],
  'service-4': [
    { timestamp: '2025-01-15 08:00:00', level: 'INFO', message: 'Redis server starting' },
    { timestamp: '2025-01-15 08:00:01', level: 'ERROR', message: 'Fatal: Cannot bind to port 6379 - address already in use' },
    { timestamp: '2025-01-15 08:00:02', level: 'ERROR', message: 'Server crashed with exit code 1' }
  ],
  'service-5': [
    { timestamp: '2025-01-15 10:40:00', level: 'INFO', message: 'Worker queue starting...' },
    { timestamp: '2025-01-15 10:40:01', level: 'INFO', message: 'Connected to message broker' },
    { timestamp: '2025-01-15 10:40:02', level: 'WARN', message: 'Queue backlog: 142 pending jobs' }
  ]
}

const LEVEL_COLORS: Record<string, string> = {
  INFO: 'var(--accent)',
  WARN: 'var(--warning)',
  ERROR: 'var(--danger)'
}

export function Logs({ services }: LogsProps) {
  const [activeTab, setActiveTab] = useState(services[0]?.id || '')

  const logs = MOCK_LOGS[activeTab] || []

  return (
    <div className="logs-page">
      <div className="page-header">
        <h2 className="page-title">Logs</h2>
        <p className="page-subtitle">View service logs and output</p>
      </div>

      <div className="logs-tabs">
        {services.map((svc) => (
          <button
            key={svc.id}
            className={`log-tab ${activeTab === svc.id ? 'active' : ''}`}
            onClick={() => setActiveTab(svc.id)}
          >
            {svc.name}
          </button>
        ))}
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="logs-empty">No logs available for this service</div>
        ) : (
          logs.map((entry, i) => (
            <div key={i} className="log-entry">
              <span className="log-timestamp">{entry.timestamp}</span>
              <span className="log-level" style={{ color: LEVEL_COLORS[entry.level] }}>
                [{entry.level}]
              </span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))
        )}
      </div>

      <style>{`
        .logs-page {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .logs-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0;
          overflow-x: auto;
        }

        .log-tab {
          padding: 10px 20px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          border-radius: 0;
          white-space: nowrap;
        }

        .log-tab:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .log-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .logs-container {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-top: none;
          border-radius: 0 0 12px 12px;
          padding: 16px;
          max-height: 600px;
          overflow-y: auto;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
        }

        .logs-empty {
          color: var(--text-muted);
          text-align: center;
          padding: 40px 0;
        }

        .log-entry {
          display: flex;
          gap: 12px;
          padding: 2px 0;
        }

        .log-entry:hover {
          background: var(--bg-hover);
        }

        .log-timestamp {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .log-level {
          font-weight: 600;
          flex-shrink: 0;
          min-width: 56px;
        }

        .log-message {
          color: var(--text-primary);
          word-break: break-word;
        }
      `}</style>
    </div>
  )
}
