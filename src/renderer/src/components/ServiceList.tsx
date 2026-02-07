import { Loader2, ServerOff } from 'lucide-react'
import type { Service } from '../../../shared/types'
import { ServiceCard } from './ServiceCard'

interface ServiceListProps {
  services: Service[]
  loading: boolean
  onStart: (id: string) => void
  onStop: (id: string) => void
  onRestart: (id: string) => void
  onDelete: (id: string) => void
}

export function ServiceList({
  services,
  loading,
  onStart,
  onStop,
  onRestart,
  onDelete
}: ServiceListProps) {
  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={40} />
        <p>Loading services...</p>
        <style>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 80px 20px;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="empty-state">
        <ServerOff size={64} strokeWidth={1} />
        <h2>No services yet</h2>
        <p>Click "Add Service" to create your first service</p>
        <style>{`
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 80px 20px;
            color: var(--text-muted);
            text-align: center;
          }

          .empty-state h2 {
            font-size: 20px;
            color: var(--text-secondary);
            margin: 0;
          }

          .empty-state p {
            margin: 0;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="service-list">
      <div className="service-grid">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onStart={onStart}
            onStop={onStop}
            onRestart={onRestart}
            onDelete={onDelete}
          />
        ))}
      </div>

      <style>{`
        .service-list {
          animation: fadeIn 0.3s ease-out;
        }

        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        @media (max-width: 500px) {
          .service-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
