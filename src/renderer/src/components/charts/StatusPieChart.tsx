import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { Service } from '../../../../shared/types'

interface Props {
  services: Service[]
}

const COLORS: Record<string, string> = {
  running: '#22c55e',
  stopped: '#6b7280',
  crashed: '#ef4444',
  starting: '#3b82f6'
}

const GLOW: Record<string, string> = {
  running: 'rgba(34, 197, 94, 0.4)',
  crashed: 'rgba(239, 68, 68, 0.4)',
  starting: 'rgba(59, 130, 246, 0.4)'
}

export function StatusPieChart({ services }: Props) {
  const counts: Record<string, number> = {}
  for (const s of services) {
    counts[s.status] = (counts[s.status] || 0) + 1
  }
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))
  const total = services.length

  return (
    <div className="chart-container">
      <h4 className="chart-title">Status Distribution</h4>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
              dataKey="value" strokeWidth={0} animationDuration={800}
              animationBegin={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || '#6b7280'}
                  style={{
                    filter: GLOW[entry.name]
                      ? `drop-shadow(0 0 6px ${GLOW[entry.name]})`
                      : undefined
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(15,15,30,0.95)', border: '1px solid #333', borderRadius: 10,
                fontSize: 12, backdropFilter: 'blur(8px)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center">
          <div className="pie-center-val">{total}</div>
          <div className="pie-center-lbl">services</div>
        </div>
      </div>
      <div className="pie-legend">
        {data.map((d) => (
          <div key={d.name} className="pie-legend-item">
            <span className="pie-legend-dot" style={{
              background: COLORS[d.name] || '#6b7280',
              boxShadow: GLOW[d.name] ? `0 0 6px ${GLOW[d.name]}` : undefined
            }} />
            <span className="pie-legend-label">{d.name}</span>
            <span className="pie-legend-value">{d.value}</span>
          </div>
        ))}
      </div>

      <style>{`
        .pie-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }
        .pie-center-val {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }
        .pie-center-lbl {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .pie-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .pie-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
        }
        .pie-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .pie-legend-label {
          color: var(--text-muted);
          text-transform: capitalize;
        }
        .pie-legend-value {
          color: var(--text-primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
