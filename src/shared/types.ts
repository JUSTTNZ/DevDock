export interface Service {
  id: string;
  name: string;
  command: string;
  cwd: string;
  port?: number;
  icon?: string;
  status: 'running' | 'stopped' | 'crashed' | 'starting';
  memory: string;
  cpu: string;
  uptime: string;
  autoRestart: boolean;
  autoStart: boolean;
  pid?: number;
  activePort?: number;
}

export interface ServiceConfig {
  name: string;
  command: string;
  cwd: string;
  port?: number;
  icon?: string;
  autoRestart: boolean;
  autoStart: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: string;
  autoRestart: boolean;
  autoStart: boolean;
  showNotifications: boolean;
  dataRetention: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}