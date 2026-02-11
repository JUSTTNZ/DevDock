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
      background: 'rgba(15, 15, 30, 0.95)', border: '1px solid rgba(52, 211, 153, 0.3)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12, backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 20px rgba(52, 211, 153, 0.2)'
    }}>
      <div style={{ color: '#666', marginBottom: 4, fontSize: 10 }}>{label}</div>
      <div style={{ color: '#34d399', fontWeight: 700, fontSize: 14 }}>{payload[0].value.toFixed(1)} MB</div>
    </div>
  )
}

function ActiveDot(props: any) {
  const { cx, cy } = props
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#34d399" opacity={0.2}>
        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={4} fill="#34d399" stroke="#fff" strokeWidth={2} />
    </g>
  )
}

export function MemoryChart({ history }: Props) {
  const latest = history.length > 0 ? history[history.length - 1].aggregateMemory : 0

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h4 className="chart-title">Memory Usage</h4>
        <span className="chart-live-value" style={{ color: '#34d399' }}>
          <span className="pulse-dot" style={{ background: '#34d399' }} />
          {latest.toFixed(1)} MB
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
            </linearGradient>
            <filter id="memGlow">
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
            tick={{ fill: '#555', fontSize: 9 }} unit=" MB"
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="aggregateMemory"
            stroke="#34d399" strokeWidth={2.5}
            fill="url(#memGrad)"
            filter="url(#memGlow)"
            animationDuration={600}
            activeDot={<ActiveDot />}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
