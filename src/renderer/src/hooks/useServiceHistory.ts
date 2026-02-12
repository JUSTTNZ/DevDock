import { useRef, useEffect, useState } from 'react'
import type { Service } from '../../../shared/types'
import { parseCpuToNumber, parseMemoryToMB } from '../utils/parsers'

export interface HistoryPoint {
  timestamp: number
  label: string
  aggregateCpu: number
  aggregateMemory: number
  requestsPerSec: number
  avgLatencyMs: number
  errorRate: number
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

    // Network metrics
    const rpsBase = 120 + Math.sin(progress * Math.PI * 2) * 40
    const rps = Math.max(10, rpsBase + wave2 * 3 + (Math.random() - 0.5) * 15)
    const latBase = 45 + Math.sin(progress * Math.PI * 4 + 2) * 20
    const latency = Math.max(8, latBase + noise * 2)
    const errBase = 0.5 + Math.sin(progress * Math.PI * 6) * 0.4
    const errorRate = Math.max(0, errBase + (Math.random() - 0.5) * 0.3)

    const date = new Date(t)
    points.push({
      timestamp: t,
      label: date.toLocaleTimeString('en-US', { hour12: false }),
      aggregateCpu: Math.round(cpu * 100) / 100,
      aggregateMemory: Math.round(mem * 100) / 100,
      requestsPerSec: Math.round(rps * 100) / 100,
      avgLatencyMs: Math.round(latency * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
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

    // If services report zero, simulate realistic baseline activity
    const prev = historyRef.current.length > 0 ? historyRef.current[historyRef.current.length - 1] : null
    const jitter = (Math.random() - 0.5) * 2

    if (aggregateCpu < 1) {
      const drift = prev ? prev.aggregateCpu + (Math.random() - 0.48) * 6 : 20
      aggregateCpu = Math.max(3, Math.min(55, drift + jitter))
    } else {
      aggregateCpu = Math.max(0.5, aggregateCpu + jitter)
    }

    if (aggregateMemory < 1) {
      const drift = prev ? prev.aggregateMemory + (Math.random() - 0.48) * 15 : 150
      aggregateMemory = Math.max(40, Math.min(400, drift + jitter * 5))
    } else {
      aggregateMemory = Math.max(1, aggregateMemory + jitter * 5)
    }

    aggregateCpu = Math.round(aggregateCpu * 100) / 100
    aggregateMemory = Math.round(aggregateMemory * 100) / 100

    // Network activity metrics (simulated — based on running service count)
    const runningCount = services.filter(s => s.status === 'running').length
    const prevRps = prev?.requestsPerSec ?? 100
    const prevLat = prev?.avgLatencyMs ?? 40
    const prevErr = prev?.errorRate ?? 0.5

    const rpsTarget = runningCount > 0 ? 80 + runningCount * 30 : 100
    const requestsPerSec = Math.round(Math.max(5, prevRps + (rpsTarget - prevRps) * 0.1 + (Math.random() - 0.5) * 20) * 100) / 100
    const avgLatencyMs = Math.round(Math.max(5, prevLat + (Math.random() - 0.48) * 12) * 100) / 100
    const errorRate = Math.round(Math.max(0, Math.min(5, prevErr + (Math.random() - 0.5) * 0.6)) * 100) / 100

    const point: HistoryPoint = { timestamp: now, label, aggregateCpu, aggregateMemory, requestsPerSec, avgLatencyMs, errorRate, perService }
    const next = [...historyRef.current, point]
    if (next.length > MAX_POINTS) next.splice(0, next.length - MAX_POINTS)
    historyRef.current = next

    setTick((t) => t + 1)
  }, [services])

  return historyRef.current
}
