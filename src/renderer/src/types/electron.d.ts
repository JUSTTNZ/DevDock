import type { Service, ServiceConfig, AppSettings } from '../../../shared/types'

export interface ElectronAPI {
  getServices: () => Promise<Service[]>
  startService: (id: string) => Promise<{ success: boolean; message?: string }>
  stopService: (id: string) => Promise<{ success: boolean; message?: string }>
  restartService: (id: string) => Promise<{ success: boolean; message?: string }>
  addService: (config: ServiceConfig) => Promise<{ success: boolean; message?: string }>
  updateService: (id: string, updates: Partial<ServiceConfig>) => Promise<{ success: boolean; message?: string }>
  deleteService: (id: string) => Promise<{ success: boolean; message?: string }>
  getCwd: () => Promise<string>
  browseFolder: () => Promise<string | null>
  getLogs: (serviceId: string) => Promise<{ timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; message: string }[]>
  clearLogs: (serviceId: string) => Promise<{ success: boolean }>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: Partial<AppSettings>) => Promise<{ success: boolean; message?: string }>
  onServiceUpdate: (callback: (data: any) => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
