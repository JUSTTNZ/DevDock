import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { ConfigManager } from './ConfigManager'
import { ServiceManager } from './ServiceManager'
import './ipc-handlers'

let mainWindow: BrowserWindow | null = null
let configManager: ConfigManager
let serviceManager: ServiceManager

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: join(__dirname, '../../resources/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f0f'
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    // Development: load from Vite dev server
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // Production: load from built files
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  configManager = new ConfigManager()
  serviceManager = new ServiceManager(configManager)

  ;(global as any).configManager = configManager
  ;(global as any).serviceManager = serviceManager
  ;(global as any).mainWindow = null

  createWindow()
  ;(global as any).mainWindow = mainWindow

  // Auto-start configured services
  const services = configManager.getAllServices()
  services.forEach((service) => {
    if (service.autoStart) {
      serviceManager.startService(service.id)
    }
  })
})

app.on('window-all-closed', () => {
  if (serviceManager) {
    serviceManager.stopAll()
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
