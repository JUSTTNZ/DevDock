import { contextBridge, ipcRenderer } from 'electron'
import type { ServiceConfig, AppSettings } from '../shared/types'

// Type definitions for the exposed API
export interface ElectronAPI {
  // Service Management
  getServices: () => Promise<any[]>
  startService: (id: string) => Promise<any>
  stopService: (id: string) => Promise<any>
  restartService: (id: string) => Promise<any>
  addService: (config: ServiceConfig) => Promise<any>
  updateService: (id: string, updates: Partial<ServiceConfig>) => Promise<any>
  deleteService: (id: string) => Promise<any>
  getCwd: () => Promise<string>
  browseFolder: () => Promise<string | null>

  // Logs
  getLogs: (serviceId: string) => Promise<any[]>
  clearLogs: (serviceId: string) => Promise<any>

  // Settings
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: Partial<AppSettings>) => Promise<any>

  // Events
  onServiceUpdate: (callback: (data: any) => void) => () => void
}

const electronAPI: ElectronAPI = {
  // Service Management
  getServices: () => ipcRenderer.invoke('get-services'),
  startService: (id: string) => ipcRenderer.invoke('start-service', id),
  stopService: (id: string) => ipcRenderer.invoke('stop-service', id),
  restartService: (id: string) => ipcRenderer.invoke('restart-service', id),
  addService: (config: ServiceConfig) => ipcRenderer.invoke('add-service', config),
  updateService: (id: string, updates: Partial<ServiceConfig>) =>
    ipcRenderer.invoke('update-service', id, updates),
  deleteService: (id: string) => ipcRenderer.invoke('delete-service', id),
  getCwd: () => ipcRenderer.invoke('get-cwd'),
  browseFolder: () => ipcRenderer.invoke('browse-folder'),

  // Logs
  getLogs: (serviceId: string) => ipcRenderer.invoke('get-logs', serviceId),
  clearLogs: (serviceId: string) => ipcRenderer.invoke('clear-logs', serviceId),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('save-settings', settings),

  // Events
  onServiceUpdate: (callback: (data: any) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: any) => callback(data)
    ipcRenderer.on('service-updated', handler)
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('service-updated', handler)
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

console.log('Preload script loaded')
