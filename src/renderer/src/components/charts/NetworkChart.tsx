import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import type { HistoryPoint } from '../../hooks/useServiceHistory'

interface Props {
  history: HistoryPoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.95)', border: '1px solid rgba(168, 85, 247, 0.3)',
      borderRadius: 10, padding: '12px 16px', fontSize: 12, backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 24px rgba(168, 85, 247, 0.15)'
    }}>
      <div style={{ color: '#666', marginBottom: 6, fontSize: 10 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#999', fontSize: 11 }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 700, fontSize: 13 }}>
            {p.dataKey === 'errorRate' ? `${p.value.toFixed(2)}%` : p.dataKey === 'avgLatencyMs' ? `${p.value.toFixed(0)} ms` : `${p.value.toFixed(0)} req/s`}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActiveDot(props: any) {
  const { cx, cy, stroke } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={stroke} opacity={0.15}>
        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={3.5} fill={stroke} stroke="#fff" strokeWidth={1.5} />
    </g>
  )
}

export function NetworkChart({ history }: Props) {
  const latest = history.length > 0 ? history[history.length - 1] : null
  const prevRps = history.length > 1 ? history[history.length - 2].requestsPerSec : 0
  const rpsDelta = latest ? latest.requestsPerSec - prevRps : 0
  const rpsUp = rpsDelta >= 0

  return (
    <div className="chart-container network-chart-container">
      <div className="chart-header">
        <h4 className="chart-title">Network Activity</h4>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div className="net-stat">
            <span className="pulse-dot" style={{ background: '#a855f7' }} />
            <span className="net-stat-label">Throughput</span>
            <span className="net-stat-value" style={{ color: '#a855f7' }}>{latest?.requestsPerSec.toFixed(0) ?? '0'} <small>req/s</small></span>
            <span className={`net-stat-delta ${rpsUp ? 'up' : 'down'}`}>{rpsUp ? '▲' : '▼'} {Math.abs(rpsDelta).toFixed(1)}</span>
          </div>
          <div className="net-stat">
            <span className="net-stat-label">Latency</span>
            <span className="net-stat-value" style={{ color: '#f59e0b' }}>{latest?.avgLatencyMs.toFixed(0) ?? '0'} <small>ms</small></span>
          </div>
          <div className="net-stat">
            <span className="net-stat-label">Error Rate</span>
            <span className="net-stat-value" style={{ color: '#ef4444' }}>{latest?.errorRate.toFixed(2) ?? '0'}<small>%</small></span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
            </linearGradient>
            <filter id="netGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="label" tick={{ fill: '#555', fontSize: 9 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false} interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="rps"
            tick={{ fill: '#555', fontSize: 9 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="latency"
            orientation="right"
            tick={{ fill: '#555', fontSize: 9 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom" height={28}
            wrapperStyle={{ fontSize: 10, color: '#888' }}
          />
          <Area
            yAxisId="rps"
            type="monotone" dataKey="requestsPerSec" name="Throughput"
            stroke="#a855f7" strokeWidth={2.5}
            fill="url(#rpsGrad)"
            filter="url(#netGlow)"
            animationDuration={600}
            activeDot={<ActiveDot />}
            dot={false}
          />
          <Area
            yAxisId="latency"
            type="monotone" dataKey="avgLatencyMs" name="Latency"
            stroke="#f59e0b" strokeWidth={1.5}
            fill="url(#latGrad)"
            animationDuration={600}
            activeDot={<ActiveDot />}
            dot={false}
          />
          <Area
            yAxisId="latency"
            type="monotone" dataKey="errorRate" name="Error Rate"
            stroke="#ef4444" strokeWidth={1.5}
            fill="url(#errGrad)"
            animationDuration={600}
            activeDot={<ActiveDot />}
            dot={false}
            strokeDasharray="4 3"
          />
        </AreaChart>
      </ResponsiveContainer>

      <style>{`
        .network-chart-container {
          grid-column: 1 / -1;
        }
        .net-stat {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .net-stat-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .net-stat-value {
          font-size: 14px;
          font-weight: 700;
          font-family: monospace;
        }
        .net-stat-value small {
          font-size: 10px;
          font-weight: 400;
          opacity: 0.7;
        }
        .net-stat-delta {
          font-size: 10px;
          font-weight: 600;
          font-family: monospace;
          padding: 1px 5px;
          border-radius: 4px;
        }
        .net-stat-delta.up {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
        }
        .net-stat-delta.down {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
        }
      `}</style>
    </div>
  )
}
