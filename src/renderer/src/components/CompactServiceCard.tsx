import type { Service } from '../../../shared/types'

interface Props {
  service: Service
  onClick: () => void
}

const statusColors: Record<string, string> = {
  running: 'var(--success)',
  stopped: 'var(--text-muted)',
  crashed: 'var(--danger)',
  starting: 'var(--accent)'
}

export function CompactServiceCard({ service, onClick }: Props) {
  const displayPort = service.activePort || service.port

  return (
    <div className="compact-card" onClick={onClick}>
      <div className="compact-card-header">
        <span
          className="compact-dot"
          style={{ background: statusColors[service.status] || 'var(--text-muted)' }}
        />
        <span className="compact-name">{service.name}</span>
        {displayPort && (
          <span className="compact-port">:{displayPort}</span>
        )}
      </div>
      <div className="compact-stats">
        <span className="compact-stat">CPU {service.cpu || '0%'}</span>
        <span className="compact-stat">MEM {service.memory || '0 MB'}</span>
      </div>

      <style>{`
        .compact-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s;
          min-width: 0;
        }
        .compact-card:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        .compact-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .compact-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .compact-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .compact-port {
          font-family: monospace;
          font-size: 11px;
          color: var(--accent);
          background: rgba(59, 130, 246, 0.1);
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 600;
          margin-left: auto;
          flex-shrink: 0;
        }
        .compact-stats {
          display: flex;
          gap: 12px;
          padding-left: 16px;
        }
        .compact-stat {
          font-size: 11px;
          color: var(--text-muted);
          font-family: monospace;
        }
      `}</style>
    </div>
  )
}
