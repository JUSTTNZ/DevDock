import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
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

  return (
    <div className="services-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Services</h2>
          <p className="page-subtitle">Manage your running services</p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary" onClick={onRefresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
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
        .services-page {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
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

        .page-actions {
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
    </div>
  )
}
