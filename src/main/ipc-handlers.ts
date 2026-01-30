import { ipcMain } from 'electron';
import { ServiceConfig, AppSettings } from '../shared/types';

function getManagers() {
  const configManager = (global as any).configManager;
  const serviceManager = (global as any).serviceManager;
  return { configManager, serviceManager };
}

// Service Management
ipcMain.handle('get-services', async () => {
  const { configManager } = getManagers();
  return configManager.getAllServices();
});

ipcMain.handle('start-service', async (event, serviceId: string) => {
  const { serviceManager } = getManagers();
  const success = serviceManager.startService(serviceId);
  return { success, message: success ? 'Service started' : 'Failed to start' };
});

ipcMain.handle('stop-service', async (event, serviceId: string) => {
  const { serviceManager } = getManagers();
  const success = serviceManager.stopService(serviceId);
  return { success, message: success ? 'Service stopped' : 'Failed to stop' };
});

ipcMain.handle('restart-service', async (event, serviceId: string) => {
  const { serviceManager } = getManagers();
  const success = serviceManager.restartService(serviceId);
  return { success, message: success ? 'Service restarted' : 'Failed to restart' };
});

ipcMain.handle('add-service', async (event, config: ServiceConfig) => {
  const { configManager } = getManagers();
  const serviceId = configManager.addService(config);
  return { success: true, serviceId, message: 'Service added' };
});

ipcMain.handle('update-service', async (event, serviceId: string, updates: Partial<ServiceConfig>) => {
  const { configManager } = getManagers();
  const success = configManager.updateService(serviceId, updates);
  return { success, message: success ? 'Service updated' : 'Service not found' };
});

ipcMain.handle('delete-service', async (event, serviceId: string) => {
  const { configManager, serviceManager } = getManagers();
  serviceManager.stopService(serviceId);
  const success = configManager.deleteService(serviceId);
  return { success, message: success ? 'Service deleted' : 'Service not found' };
});

// Settings
ipcMain.handle('get-settings', async () => {
  const { configManager } = getManagers();
  return configManager.getSettings();
});

ipcMain.handle('save-settings', async (event, settings: AppSettings) => {
  const { configManager } = getManagers();
  configManager.updateSettings(settings);
  return { success: true, message: 'Settings saved' };
});

// Get current working directory
ipcMain.handle('get-cwd', async () => {
  return process.cwd();
});

console.log('IPC handlers registered');
