import { useState, useCallback } from 'react'
import type { Service, ServiceConfig } from '../../../shared/types'

const MOCK_SERVICES: Service[] = [
  {
    id: 'service-1',
    name: 'Backend API',
    command: 'npm run dev',
    cwd: 'C:\\Projects\\backend',
    port: 3001,
    status: 'running',
    memory: '128 MB',
    cpu: '2.4%',
    uptime: '2h 15m',
    autoRestart: true,
    autoStart: true,
    pid: 12345
  },
  {
    id: 'service-2',
    name: 'Frontend App',
    command: 'npm start',
    cwd: 'C:\\Projects\\frontend',
    port: 3000,
    status: 'running',
    memory: '256 MB',
    cpu: '5.1%',
    uptime: '1h 42m',
    autoRestart: false,
    autoStart: true,
    pid: 12346
  },
  {
    id: 'service-3',
    name: 'PostgreSQL',
    command: 'pg_ctl start -D /data',
    cwd: 'C:\\Program Files\\PostgreSQL',
    port: 5432,
    status: 'stopped',
    memory: '0 MB',
    cpu: '0%',
    uptime: '0s',
    autoRestart: true,
    autoStart: false
  },
  {
    id: 'service-4',
    name: 'Redis Cache',
    command: 'redis-server',
    cwd: 'C:\\Redis',
    port: 6379,
    status: 'crashed',
    memory: '0 MB',
    cpu: '0%',
    uptime: '0s',
    autoRestart: true,
    autoStart: true
  },
  {
    id: 'service-5',
    name: 'Worker Queue',
    command: 'node worker.js',
    cwd: 'C:\\Projects\\backend',
    status: 'starting',
    memory: '64 MB',
    cpu: '1.2%',
    uptime: '5s',
    autoRestart: true,
    autoStart: false
  }
]

export function useServices() {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES)
  const [loading] = useState(false)

  const fetchServices = useCallback(async () => {}, [])

  const startService = useCallback(async (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'running' as const } : s))
    )
    return { success: true, message: 'Service started' }
  }, [])

  const stopService = useCallback(async (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'stopped' as const } : s))
    )
    return { success: true, message: 'Service stopped' }
  }, [])

  const restartService = useCallback(async (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'starting' as const } : s))
    )
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'running' as const } : s))
      )
    }, 1500)
    return { success: true, message: 'Service restarted' }
  }, [])

  const addService = useCallback(async (config: ServiceConfig) => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      ...config,
      status: 'stopped',
      memory: '0 MB',
      cpu: '0%',
      uptime: '0s'
    }
    setServices((prev) => [...prev, newService])
    return { success: true, message: 'Service added' }
  }, [])

  const deleteService = useCallback(async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    return { success: true, message: 'Service deleted' }
  }, [])

  return {
    services,
    loading,
    error: null,
    refresh: fetchServices,
    startService,
    stopService,
    restartService,
    addService,
    deleteService
  }
}
