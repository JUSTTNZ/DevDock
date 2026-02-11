export function parseCpuToNumber(cpu: string): number {
  if (!cpu) return 0
  const match = cpu.match(/([\d.]+)/)
  return match ? parseFloat(match[1]) : 0
}

export function parseMemoryToMB(memory: string): number {
  if (!memory) return 0
  const match = memory.match(/([\d.]+)\s*(GB|MB|KB|B)?/i)
  if (!match) return 0
  const value = parseFloat(match[1])
  const unit = (match[2] || 'MB').toUpperCase()
  switch (unit) {
    case 'GB': return value * 1024
    case 'MB': return value
    case 'KB': return value / 1024
    case 'B': return value / (1024 * 1024)
    default: return value
  }
}
