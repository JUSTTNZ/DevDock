import { AppSettings } from './types';

export const CONFIG_DIR = '.devdashboard';
export const CONFIG_FILE = 'config.json';
export const SETTINGS_FILE = 'settings.json';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#3B82F6',
  autoRestart: true,
  autoStart: false,
  showNotifications: true,
  dataRetention: 7
};