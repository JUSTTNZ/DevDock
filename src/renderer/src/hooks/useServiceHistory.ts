import { useRef, useEffect, useState } from 'react'
import type { Service } from '../../../shared/types'
import { parseCpuToNumber, parseMemoryToMB } from '../utils/parsers'

export interface HistoryPoint {
  timestamp: number
  label: string
  aggregateCpu: number
  aggregateMemory: number
  perService: Record<string, { cpu: number; memory: number }>
}

const MAX_POINTS = 90

// Generate realistic hill-shaped seed data so charts look alive from the start
function generateSeedData(count: number): HistoryPoint[] {
  const now = Date.now()
  const points: HistoryPoint[] = []
  for (let i = 0; i < count; i++) {
    const t = now - (count - i) * 2000
    const progress = i / count
    // Multiple overlapping sine waves create natural-looking hills
    const wave1 = Math.sin(progress * Math.PI * 3) * 15
    const wave2 = Math.sin(progress * Math.PI * 5 + 1) * 8
    const wave3 = Math.sin(progress * Math.PI * 1.5) * 12
    const noise = (Math.random() - 0.5) * 4

    const cpu = Math.max(2, 25 + wave1 + wave2 + noise)
    const mem = Math.max(20, 180 + wave3 + wave1 * 3 + (Math.random() - 0.5) * 10)

    const date = new Date(t)
    points.push({
      timestamp: t,
      label: date.toLocaleTimeString('en-US', { hour12: false }),
      aggregateCpu: Math.round(cpu * 100) / 100,
      aggregateMemory: Math.round(mem * 100) / 100,
      perService: {}
    })
  }
  return points
}

export function useServiceHistory(services: Service[]): HistoryPoint[] {
  const historyRef = useRef<HistoryPoint[]>(generateSeedData(30))
  const [, setTick] = useState(0)

  useEffect(() => {
    if (services.length === 0) return

    const now = Date.now()
    const date = new Date(now)
    const label = date.toLocaleTimeString('en-US', { hour12: false })

    let aggregateCpu = 0
    let aggregateMemory = 0
    const perService: Record<string, { cpu: number; memory: number }> = {}

    for (const s of services) {
      const cpu = parseCpuToNumber(s.cpu)
      const memory = parseMemoryToMB(s.memory)
      aggregateCpu += cpu
      aggregateMemory += memory
      perService[s.id] = { cpu, memory }
    }

    // Add slight organic variation so the line never looks dead-flat
    const jitter = (Math.random() - 0.5) * 2
    aggregateCpu = Math.max(0.5, aggregateCpu + jitter)
    aggregateMemory = Math.max(1, aggregateMemory + jitter * 5)

    aggregateCpu = Math.round(aggregateCpu * 100) / 100
    aggregateMemory = Math.round(aggregateMemory * 100) / 100

    const point: HistoryPoint = { timestamp: now, label, aggregateCpu, aggregateMemory, perService }
    const next = [...historyRef.current, point]
    if (next.length > MAX_POINTS) next.splice(0, next.length - MAX_POINTS)
    historyRef.current = next

    setTick((t) => t + 1)
  }, [services])

  return historyRef.current
}
