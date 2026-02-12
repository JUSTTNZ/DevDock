import { ipcMain, dialog, BrowserWindow } from 'electron';
import { ServiceConfig, AppSettings } from '../shared/types';

function getManagers() {
  const configManager = (global as any).configManager;
  const serviceManager = (global as any).serviceManager;
  return { configManager, serviceManager };
}

// Service Management
ipcMain.handle('get-services', async () => {
  const { configManager, serviceManager } = getManagers();
  await serviceManager.updateServiceStats();
  return configManager.getAllServices();
});

ipcMain.handle('start-service', async (event, serviceId: string) => {
  const { serviceManager } = getManagers();
  const success = await serviceManager.startService(serviceId);
  return { success, message: success ? 'Service started' : 'Failed to start' };
});

ipcMain.handle('stop-service', async (event, serviceId: string) => {
  const { serviceManager } = getManagers();
  const success = await serviceManager.stopService(serviceId);
  return { success, message: success ? 'Service stopped' : 'Failed to stop' };
});

ipcMain.handle('restart-service', async (event, serviceId: string) => {
  const { serviceManager } = getManagers();
  const success = await serviceManager.restartService(serviceId);
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
  await serviceManager.stopService(serviceId);
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

// Logs
ipcMain.handle('get-logs', async (_event, serviceId: string) => {
  const { serviceManager } = getManagers();
  return serviceManager.getLogs(serviceId);
});

ipcMain.handle('clear-logs', async (_event, serviceId: string) => {
  const { serviceManager } = getManagers();
  serviceManager.clearLogs(serviceId);
  return { success: true };
});

// Browse for folder
ipcMain.handle('browse-folder', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(win!, {
    properties: ['openDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

console.log('IPC handlers registered');
