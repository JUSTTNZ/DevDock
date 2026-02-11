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
      <div className="svc-loading">
        <div className="svc-loading-spinner">
          <Loader2 size={36} />
        </div>
        <p>Loading services...</p>
        <style>{`
          .svc-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 80px 20px;
            color: var(--text-muted);
          }
          .svc-loading-spinner {
            animation: spin 1s linear infinite;
            color: var(--accent);
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="svc-empty">
        <div className="svc-empty-icon">
          <ServerOff size={56} strokeWidth={1} />
        </div>
        <h2>No services yet</h2>
        <p>Click "Add Service" to create your first service</p>
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .svc-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 80px 20px;
            color: var(--text-muted);
            text-align: center;
            animation: fadeInScale 0.4s ease-out;
          }
          .svc-empty-icon {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 4px;
          }
          .svc-empty h2 {
            font-size: 18px;
            color: var(--text-secondary);
            margin: 0;
          }
          .svc-empty p {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="svc-list">
      <div className="svc-grid">
        {services.map((service, i) => (
          <div key={service.id} style={{ animationDelay: `${i * 0.06}s` }}>
            <ServiceCard
              service={service}
              onStart={onStart}
              onStop={onStop}
              onRestart={onRestart}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      <style>{`
        .svc-list {
          animation: fadeIn 0.3s ease-out;
        }
        .svc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 16px;
        }
        @media (max-width: 500px) {
          .svc-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
