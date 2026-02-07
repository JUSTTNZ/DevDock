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
  const statusColors = {
    running: 'var(--success)',
    stopped: 'var(--text-muted)',
    crashed: 'var(--danger)',
    starting: 'var(--warning)'
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      onDelete(service.id)
    }
  }

  return (
    <div className={`service-card ${service.status}`}>
      <div className="service-header">
        <div className="service-info">
          <div className="status-indicator" style={{ background: statusColors[service.status] }} />
          <div>
            <h3 className="service-name">{service.name}</h3>
            <span className="service-status">{service.status}</span>
          </div>
        </div>
        {service.port && <span className="service-port">:{service.port}</span>}
      </div>

      <div className="service-details">
        <div className="detail-item">
          <Terminal size={14} />
          <span className="detail-value">{service.command}</span>
        </div>
        <div className="detail-item">
          <Folder size={14} />
          <span className="detail-value">{service.cwd}</span>
        </div>
      </div>

      <div className="service-metrics">
        <div className="metric">
          <HardDrive size={14} />
          <span>{service.memory}</span>
        </div>
        <div className="metric">
          <Cpu size={14} />
          <span>{service.cpu}</span>
        </div>
        <div className="metric">
          <Clock size={14} />
          <span>{service.uptime}</span>
        </div>
      </div>

      <div className="service-actions">
        {service.status === 'running' ? (
          <>
            <button className="action-btn stop" onClick={() => onStop(service.id)} title="Stop">
              <Square size={16} />
            </button>
            <button className="action-btn restart" onClick={() => onRestart(service.id)} title="Restart">
              <RotateCw size={16} />
            </button>
          </>
        ) : (
          <button className="action-btn start" onClick={() => onStart(service.id)} title="Start">
            <Play size={16} />
          </button>
        )}
        <button className="action-btn delete" onClick={handleDelete} title="Delete">
          <Trash2 size={16} />
        </button>
      </div>

      <style>{`
        .service-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
          animation: fadeIn 0.3s ease-out;
        }

        .service-card:hover {
          border-color: var(--border-light);
          transform: translateY(-2px);
        }

        .service-card.running {
          border-left: 3px solid var(--success);
        }

        .service-card.stopped {
          border-left: 3px solid var(--text-muted);
        }

        .service-card.crashed {
          border-left: 3px solid var(--danger);
        }

        .service-card.starting {
          border-left: 3px solid var(--warning);
        }

        .service-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .service-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .service-card.starting .status-indicator {
          animation: pulse 1s infinite;
        }

        .service-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .service-status {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .service-port {
          font-family: monospace;
          font-size: 14px;
          color: var(--accent);
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .service-details {
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .detail-item svg {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .detail-value {
          font-family: monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .service-metrics {
          display: flex;
          gap: 16px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .metric svg {
          color: var(--text-muted);
        }

        .service-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .action-btn:hover {
          color: var(--text-primary);
        }

        .action-btn.start:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--success);
          color: var(--success);
        }

        .action-btn.stop:hover {
          background: rgba(107, 114, 128, 0.1);
          border-color: var(--text-muted);
        }

        .action-btn.restart:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: var(--accent);
          color: var(--accent);
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--danger);
          color: var(--danger);
        }
      `}</style>
    </div>
  )
}
