import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts'
import type { Service } from '../../../../shared/types'
import { parseCpuToNumber, parseMemoryToMB } from '../../utils/parsers'

interface Props {
  services: Service[]
}

const statusColors: Record<string, string> = {
  running: '#22c55e',
  stopped: '#6b7280',
  crashed: '#ef4444',
  starting: '#3b82f6'
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(15,15,30,0.95)', border: '1px solid #333', borderRadius: 10,
      padding: '10px 14px', fontSize: 12, backdropFilter: 'blur(8px)'
    }}>
      <div style={{ color: '#ccc', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.fill || p.color }}>
          {p.dataKey === 'cpu' ? 'CPU' : 'Memory'}: {p.value.toFixed(1)}{p.dataKey === 'cpu' ? '%' : ' MB'}
        </div>
      ))}
    </div>
  )
}

export function ServiceBars({ services }: Props) {
  const data = services.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + '\u2026' : s.name,
    cpu: parseCpuToNumber(s.cpu),
    memory: parseMemoryToMB(s.memory),
    status: s.status
  }))

  return (
    <div className="chart-container">
      <h4 className="chart-title">Per-Service Resources</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#555', fontSize: 9 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <YAxis
            type="category" dataKey="name" width={90}
            tick={{ fill: '#999', fontSize: 11 }}
            tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cpu" barSize={8} radius={[0, 4, 4, 0]} name="CPU %" animationDuration={800}>
            {data.map((entry, i) => (
              <Cell key={i} fill={statusColors[entry.status] || '#6b7280'} fillOpacity={0.9} />
            ))}
          </Bar>
          <Bar dataKey="memory" fill="#60a5fa" barSize={8} radius={[0, 4, 4, 0]} name="Memory MB" animationDuration={800} fillOpacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
