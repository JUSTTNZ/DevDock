import { Activity, Square, AlertTriangle, Server } from 'lucide-react'
import type { Service } from '../../../shared/types'
import { ServiceCard } from '../components/ServiceCard'

interface DashboardProps {
  services: Service[]
  onStart: (id: string) => void
  onStop: (id: string) => void
  onRestart: (id: string) => void
  onDelete: (id: string) => void
}

export function Dashboard({ services, onStart, onStop, onRestart, onDelete }: DashboardProps) {
  const total = services.length
  const running = services.filter((s) => s.status === 'running').length
  const stopped = services.filter((s) => s.status === 'stopped').length
  const crashed = services.filter((s) => s.status === 'crashed').length

  const stats = [
    { label: 'Total Services', value: total, icon: Server, color: 'var(--accent)' },
    { label: 'Running', value: running, icon: Activity, color: 'var(--success)' },
    { label: 'Stopped', value: stopped, icon: Square, color: 'var(--text-muted)' },
    { label: 'Crashed', value: crashed, icon: AlertTriangle, color: 'var(--danger)' }
  ]

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Overview of all your services</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title">Service Overview</h3>
      <div className="service-overview-grid">
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
        .dashboard-page {
          animation: fadeIn 0.3s ease-out;
        }

        .page-header {
          margin-bottom: 28px;
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 16px 0;
        }

        .service-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .service-overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
