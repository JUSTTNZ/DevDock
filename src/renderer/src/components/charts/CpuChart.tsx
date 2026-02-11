import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import type { HistoryPoint } from '../../hooks/useServiceHistory'

interface Props {
  history: HistoryPoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.95)', border: '1px solid rgba(96, 165, 250, 0.3)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12, backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 20px rgba(96, 165, 250, 0.2)'
    }}>
      <div style={{ color: '#666', marginBottom: 4, fontSize: 10 }}>{label}</div>
      <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 14 }}>{payload[0].value.toFixed(1)}%</div>
    </div>
  )
}

function ActiveDot(props: any) {
  const { cx, cy } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#60a5fa" opacity={0.2}>
        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={4} fill="#60a5fa" stroke="#fff" strokeWidth={2} />
    </g>
  )
}

export function CpuChart({ history }: Props) {
  const latest = history.length > 0 ? history[history.length - 1].aggregateCpu : 0

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">CPU Usage</h4>
        <span className="chart-live-value" style={{ color: '#60a5fa' }}>
          <span className="pulse-dot" style={{ background: '#60a5fa' }} />
          {latest.toFixed(1)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.02} />
            </linearGradient>
            <filter id="cpuGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
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
            tick={{ fill: '#555', fontSize: 9 }} unit="%"
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="aggregateCpu"
            stroke="#60a5fa" strokeWidth={2.5}
            fill="url(#cpuGrad)"
            filter="url(#cpuGlow)"
            animationDuration={600}
            activeDot={<ActiveDot />}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
