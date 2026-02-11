import { useState } from 'react'
import { Plus, RefreshCw, Server, Activity } from 'lucide-react'
import type { Service, ServiceConfig } from '../../../shared/types'
import { ServiceList } from '../components/ServiceList'
import { AddServiceModal } from '../components/AddServiceModal'

interface ServicesProps {
  services: Service[]
  loading: boolean
  onRefresh: () => void
  onStart: (id: string) => void
  onStop: (id: string) => void
  onRestart: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (config: ServiceConfig) => Promise<{ success: boolean; message?: string }>
}

export function Services({
  services,
  loading,
  onRefresh,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onAdd
}: ServicesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const running = services.filter((s) => s.status === 'running').length

  return (
    <div className="svc-page">
      <div className="svc-page-header">
        <div>
          <h2 className="svc-page-title">Services</h2>
          <p className="svc-page-sub">Manage your running services</p>
        </div>
        <div className="svc-page-actions">
          <div className="svc-page-badges">
            <span className="svc-badge">
              <Server size={13} />
              {services.length} total
            </span>
            <span className="svc-badge svc-badge--green">
              <Activity size={13} />
              {running} running
            </span>
          </div>
          <button className="svc-btn-secondary" onClick={onRefresh}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="svc-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={15} />
            Add Service
          </button>
        </div>
      </div>

      <ServiceList
        services={services}
        loading={loading}
        onStart={onStart}
        onStop={onStop}
        onRestart={onRestart}
        onDelete={onDelete}
      />

      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onAdd}
      />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .svc-page {
          animation: fadeIn 0.3s ease-out;
        }

        .svc-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
          animation: slideDown 0.4s ease-out;
        }

        .svc-page-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px 0;
        }

        .svc-page-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .svc-page-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .svc-page-badges {
          display: flex;
          gap: 8px;
          margin-right: 4px;
        }
        .svc-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 5px 12px;
          font-weight: 500;
        }
        .svc-badge--green {
          color: var(--success);
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.08);
        }

        .svc-btn-primary,
        .svc-btn-secondary {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 13px;
          transition: all 0.2s;
        }

        .svc-btn-primary {
          background: var(--accent);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
        }
        .svc-btn-primary:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
          transform: translateY(-1px);
        }

        .svc-btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .svc-btn-secondary:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--border-light);
        }
      `}</style>
    </div>
  )
}
