import { useState, useEffect, useCallback, useRef } from 'react'
import type { Service, ServiceConfig } from '../../../shared/types'

const POLL_INTERVAL = 2000

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchServices = useCallback(async () => {
    try {
      const data = await window.electronAPI.getServices()
      setServices(data)
    } catch (err) {
      console.error('Failed to fetch services:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchServices()
    intervalRef.current = setInterval(fetchServices, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchServices])

  const startService = useCallback(async (id: string) => {
    const result = await window.electronAPI.startService(id)
    await fetchServices()
    return result
  }, [fetchServices])

  const stopService = useCallback(async (id: string) => {
    const result = await window.electronAPI.stopService(id)
    await fetchServices()
    return result
  }, [fetchServices])

  const restartService = useCallback(async (id: string) => {
    const result = await window.electronAPI.restartService(id)
    // Fetch after a short delay since restart has a 1s gap
    setTimeout(fetchServices, 1500)
    return result
  }, [fetchServices])

  const addService = useCallback(async (config: ServiceConfig) => {
    const result = await window.electronAPI.addService(config)
    await fetchServices()
    return result
  }, [fetchServices])

  const deleteService = useCallback(async (id: string) => {
    const result = await window.electronAPI.deleteService(id)
    await fetchServices()
    return result
  }, [fetchServices])

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
