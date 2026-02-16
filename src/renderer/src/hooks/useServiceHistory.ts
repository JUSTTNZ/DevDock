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

export function useServiceHistory(services: Service[]): HistoryPoint[] {
  const historyRef = useRef<HistoryPoint[]>([])
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
