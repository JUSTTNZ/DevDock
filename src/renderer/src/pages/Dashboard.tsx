import { useState, useEffect } from 'react'
import { Activity, Square, AlertTriangle, Server, Cpu, HardDrive, TrendingUp, Clock } from 'lucide-react'
import type { Service } from '../../../shared/types'
import type { Page } from '../components/Sidebar'
import type { HistoryPoint } from '../hooks/useServiceHistory'
import { parseCpuToNumber, parseMemoryToMB } from '../utils/parsers'
import { CpuChart } from '../components/charts/CpuChart'
import { MemoryChart } from '../components/charts/MemoryChart'
import { NetworkChart } from '../components/charts/NetworkChart'
import { StatusPieChart } from '../components/charts/StatusPieChart'
import { CompactServiceCard } from '../components/CompactServiceCard'

interface DashboardProps {
  services: Service[]
  history: HistoryPoint[]
  onNavigate: (page: Page) => void
}

export function Dashboard({ services, history, onNavigate }: DashboardProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const total = services.length
  const running = services.filter((s) => s.status === 'running').length
  const stopped = services.filter((s) => s.status === 'stopped').length
  const crashed = services.filter((s) => s.status === 'crashed').length

  const totalCpu = services.reduce((sum, s) => sum + parseCpuToNumber(s.cpu), 0)
  const totalMemory = services.reduce((sum, s) => sum + parseMemoryToMB(s.memory), 0)
  const avgCpu = total > 0 ? totalCpu / total : 0
  const pctRunning = total > 0 ? Math.round((running / total) * 100) : 0

  const stats = [
    { label: 'Total', value: total, icon: Server, color: 'var(--accent)' },
    { label: 'Running', value: running, icon: Activity, color: 'var(--success)' },
    { label: 'Stopped', value: stopped, icon: Square, color: 'var(--text-muted)' },
    { label: 'Crashed', value: crashed, icon: AlertTriangle, color: 'var(--danger)' }
  ]

  return (
    <div className="dash">
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-sub">
            Live overview of all services
            <span className="live-badge"><span className="live-badge-dot" />LIVE</span>
          </p>
        </div>
        <div className="dash-clock">
          <Clock size={14} />
          {now.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>

      {/* Stats row */}
      <div className="dash-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="dash-stat">
            <div className="dash-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={16} />
            </div>
            <div className="dash-stat-info">
              <span className="dash-stat-val">{stat.value}</span>
              <span className="dash-stat-lbl">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Computed metrics */}
      <div className="dash-metrics">
        <div className="dash-metric">
          <Cpu size={13} />
          <span>Total CPU: <strong>{totalCpu.toFixed(1)}%</strong></span>
        </div>
        <div className="dash-metric">
          <HardDrive size={13} />
          <span>Total Memory: <strong>{totalMemory.toFixed(1)} MB</strong></span>
        </div>
        <div className="dash-metric">
          <TrendingUp size={13} />
          <span>Avg CPU: <strong>{avgCpu.toFixed(1)}%</strong></span>
        </div>
        <div className="dash-metric">
          <Activity size={13} />
          <span>Uptime: <strong>{pctRunning}%</strong> running</span>
        </div>
      </div>

      {/* Charts row 1: CPU + Memory */}
      <div className="dash-charts-row">
        <CpuChart history={history} />
        <MemoryChart history={history} />
      </div>

      {/* Charts row 2: Network Activity (full width) */}
      <div className="dash-charts-row dash-charts-row-2">
        <NetworkChart history={history} />
      </div>

      {/* Charts row 3: Status Pie */}
      <div className="dash-charts-row dash-charts-row-3">
        <StatusPieChart services={services} />
      </div>

      {/* Compact service grid */}
      {services.length > 0 && (
        <>
          <h4 className="dash-section-title">Services</h4>
          <div className="dash-compact-grid">
            {services.map((s) => (
              <CompactServiceCard key={s.id} service={s} onClick={() => onNavigate('services')} />
            ))}
          </div>
        </>
      )}

      <style>{`
        .dash { animation: fadeIn 0.3s ease-out; }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          animation: slideUp 0.4s ease-out;
        }
        .dash-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px 0;
        }
        .dash-sub {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .live-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse-glow 1.5s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
        }
        .dash-clock {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-muted);
          font-family: monospace;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 6px 12px;
        }

        /* Stats */
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .dash-stat {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: border-color 0.3s, transform 0.2s;
          animation: slideUp 0.4s ease-out both;
        }
        .dash-stat:nth-child(1) { animation-delay: 0.05s; }
        .dash-stat:nth-child(2) { animation-delay: 0.1s; }
        .dash-stat:nth-child(3) { animation-delay: 0.15s; }
        .dash-stat:nth-child(4) { animation-delay: 0.2s; }
        .dash-stat:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        .dash-stat-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dash-stat-info {
          display: flex;
          flex-direction: column;
        }
        .dash-stat-val {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        .dash-stat-lbl {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Metrics strip */
        .dash-metrics {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          padding: 10px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 10px;
          animation: slideUp 0.4s ease-out 0.25s both;
        }
        .dash-metric {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .dash-metric strong {
          color: var(--text-primary);
        }

        /* Charts */
        .chart-container {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          flex: 1;
          min-width: 0;
          transition: border-color 0.3s;
        }
        .chart-container:hover {
          border-color: rgba(255,255,255,0.1);
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .chart-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .chart-live-value {
          font-size: 14px;
          font-weight: 700;
          font-family: monospace;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Pulsing dot used in chart headers & clock */
        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          position: relative;
          flex-shrink: 0;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: inherit;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        .dash-charts-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          animation: slideUp 0.5s ease-out 0.3s both;
        }
        .dash-charts-row > * {
          flex: 1;
        }
        .dash-charts-row-2 {
          animation: slideUp 0.5s ease-out 0.4s both;
        }
        .dash-charts-row-3 {
          animation: slideUp 0.5s ease-out 0.45s both;
        }

        /* Compact grid */
        .dash-section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 16px 0 10px 0;
        }
        .dash-compact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
          animation: slideUp 0.5s ease-out 0.5s both;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .dash-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .dash-charts-row,
          .dash-charts-row-2,
          .dash-charts-row-3 {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
