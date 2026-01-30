import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Service, ServiceConfig, AppSettings } from '../shared/types';
import { CONFIG_DIR, CONFIG_FILE, SETTINGS_FILE, DEFAULT_SETTINGS } from '../shared/constants';

export class ConfigManager {
  private configPath: string;
  private settingsPath: string;
  private services: Map<string, Service>;
  private settings: AppSettings;

  constructor() {
    // Config directory: ~/.devdashboard/
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, CONFIG_DIR);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    this.configPath = path.join(configDir, CONFIG_FILE);
    this.settingsPath = path.join(configDir, SETTINGS_FILE);
    this.services = new Map();
    this.settings = DEFAULT_SETTINGS;

    this.loadConfig();
    this.loadSettings();
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const config = JSON.parse(data);
        
        if (config.services && Array.isArray(config.services)) {
          config.services.forEach((service: Service) => {
            this.services.set(service.id, service);
          });
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  private saveConfig(): void {
    try {
      const config = {
        services: Array.from(this.services.values())
      };
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  private loadSettings(): void {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Service management
  getAllServices(): Service[] {
    return Array.from(this.services.values());
  }

  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  addService(config: ServiceConfig): string {
    const id = `service-${Date.now()}`;
    const service: Service = {
      id,
      ...config,
      status: 'stopped',
      memory: '0 MB',
      cpu: '0%',
      uptime: '0s'
    };
    
    this.services.set(id, service);
    this.saveConfig();
    return id;
  }

  updateService(id: string, updates: Partial<ServiceConfig>): boolean {
    const service = this.services.get(id);
    if (!service) return false;

    Object.assign(service, updates);
    this.saveConfig();
    return true;
  }

  deleteService(id: string): boolean {
    const deleted = this.services.delete(id);
    if (deleted) {
      this.saveConfig();
    }
    return deleted;
  }

  // Settings management
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
  }
}