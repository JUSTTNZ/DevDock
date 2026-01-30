import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Service Management
  getServices: () => ipcRenderer.invoke('get-services'),
  startService: (id: string) => ipcRenderer.invoke('start-service', id),
  stopService: (id: string) => ipcRenderer.invoke('stop-service', id),
  restartService: (id: string) => ipcRenderer.invoke('restart-service', id),
  addService: (config: any) => ipcRenderer.invoke('add-service', config),
  updateService: (id: string, updates: any) => ipcRenderer.invoke('update-service', id, updates),
  deleteService: (id: string) => ipcRenderer.invoke('delete-service', id),
  getCwd: () => ipcRenderer.invoke('get-cwd'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),

  // Events
  onServiceUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('service-updated', (event, data) => callback(data));
  }

  // ... existing code ...
  
  // Utility
});

console.log('Preload script loaded');
