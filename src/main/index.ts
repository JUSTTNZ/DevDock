import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ConfigManager } from './ConfigManager';
import { ServiceManager } from './ServiceManager';
import './ipc-handlers';

let mainWindow: BrowserWindow | null = null;
let configManager: ConfigManager;
let serviceManager: ServiceManager;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../../src/renderer/index.html'));

  // Open DevTools in development
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  configManager = new ConfigManager();
  serviceManager = new ServiceManager(configManager);

  (global as any).configManager = configManager;
  (global as any).serviceManager = serviceManager;
  (global as any).mainWindow = null;

  createWindow();
  (global as any).mainWindow = mainWindow;

  const services = configManager.getAllServices();
  services.forEach(service => {
    if (service.autoStart) {
      serviceManager.startService(service.id);
    }
  });
});

app.on('window-all-closed', () => {
  if (serviceManager) {
    serviceManager.stopAll();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
