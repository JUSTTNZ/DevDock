import { Play, Square, RotateCw, Trash2, Cpu, HardDrive, Clock, Terminal, Folder } from 'lucide-react'
import type { Service } from '../../../shared/types'

interface ServiceCardProps {
  service: Service
  onStart: (id: string) => void
  onStop: (id: string) => void
  onRestart: (id: string) => void
  onDelete: (id: string) => void
}

export function ServiceCard({ service, onStart, onStop, onRestart, onDelete }: ServiceCardProps) {
  const statusColors: Record<string, string> = {
    running: 'var(--success)',
    stopped: 'var(--text-muted)',
    crashed: 'var(--danger)',
    starting: 'var(--warning)'
  }

  const statusGlow: Record<string, string> = {
    running: '0 0 8px rgba(34, 197, 94, 0.4)',
    crashed: '0 0 8px rgba(239, 68, 68, 0.4)',
    starting: '0 0 8px rgba(245, 158, 11, 0.4)'
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      onDelete(service.id)
    }
  }

  return (
    <div className={`svc-card svc-card--${service.status}`}>
      <div className="svc-card-header">
        <div className="svc-card-info">
          <div
            className={`svc-dot ${service.status === 'running' ? 'svc-dot--pulse' : ''}`}
            style={{
              background: statusColors[service.status],
              boxShadow: statusGlow[service.status] || 'none'
            }}
          />
          <div>
            <h3 className="svc-card-name">{service.name}</h3>
            <span className="svc-card-status">{service.status}</span>
          </div>
        </div>
        {(service.activePort || service.port) && (
          <span className="svc-card-port">
            :{service.activePort || service.port}
            {service.activePort && service.activePort !== service.port && (
              <span className="svc-port-note" title={`Configured: ${service.port}`}> (was :{service.port})</span>
            )}
          </span>
        )}
      </div>

      <div className="svc-card-details">
        <div className="svc-detail">
          <Terminal size={13} />
          <span className="svc-detail-val">{service.command}</span>
        </div>
        <div className="svc-detail">
          <Folder size={13} />
          <span className="svc-detail-val">{service.cwd}</span>
        </div>
      </div>

      <div className="svc-card-metrics">
        <div className="svc-metric">
          <HardDrive size={13} />
          <span>{service.memory}</span>
        </div>
        <div className="svc-metric">
          <Cpu size={13} />
          <span>{service.cpu}</span>
        </div>
        <div className="svc-metric">
          <Clock size={13} />
          <span>{service.uptime}</span>
        </div>
      </div>

      <div className="svc-card-actions">
        {service.status === 'running' ? (
          <>
            <button className="svc-btn svc-btn--stop" onClick={() => onStop(service.id)} title="Stop">
              <Square size={15} />
              <span>Stop</span>
            </button>
            <button className="svc-btn svc-btn--restart" onClick={() => onRestart(service.id)} title="Restart">
              <RotateCw size={15} />
              <span>Restart</span>
            </button>
          </>
        ) : (
          <button className="svc-btn svc-btn--start" onClick={() => onStart(service.id)} title="Start">
            <Play size={15} />
            <span>Start</span>
          </button>
        )}
        <button className="svc-btn svc-btn--delete" onClick={handleDelete} title="Delete">
          <Trash2 size={15} />
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .svc-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
          transition: border-color 0.3s, transform 0.2s, box-shadow 0.3s;
          animation: slideUp 0.4s ease-out both;
        }
        .svc-card:hover {
          border-color: var(--border-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .svc-card--running { border-left: 3px solid var(--success); }
        .svc-card--stopped { border-left: 3px solid var(--text-muted); }
        .svc-card--crashed { border-left: 3px solid var(--danger); }
        .svc-card--starting { border-left: 3px solid var(--warning); }

        .svc-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .svc-card-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .svc-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: box-shadow 0.3s;
        }
        .svc-dot--pulse {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .svc-card-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 2px 0;
        }
        .svc-card-status {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: capitalize;
          letter-spacing: 0.3px;
        }
        .svc-card-port {
          font-family: monospace;
          font-size: 13px;
          color: var(--accent);
          background: rgba(59, 130, 246, 0.1);
          padding: 3px 10px;
          border-radius: 6px;
          font-weight: 600;
        }
        .svc-port-note {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 400;
        }

        .svc-card-details {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .svc-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 12px;
        }
        .svc-detail svg { color: var(--text-muted); flex-shrink: 0; }
        .svc-detail-val {
          font-family: 'Consolas', 'Monaco', monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .svc-card-metrics {
          display: flex;
          gap: 16px;
          padding: 10px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 14px;
        }
        .svc-metric {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-secondary);
          font-family: monospace;
        }
        .svc-metric svg { color: var(--text-muted); }

        .svc-card-actions {
          display: flex;
          gap: 8px;
        }
        .svc-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .svc-btn--start:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: var(--success);
          color: var(--success);
        }
        .svc-btn--stop:hover {
          background: rgba(107, 114, 128, 0.15);
          border-color: var(--text-muted);
          color: var(--text-primary);
        }
        .svc-btn--restart:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: var(--accent);
          color: var(--accent);
        }
        .svc-btn--delete {
          margin-left: auto;
        }
        .svc-btn--delete:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: var(--danger);
          color: var(--danger);
        }
      `}</style>
    </div>
  )
}
