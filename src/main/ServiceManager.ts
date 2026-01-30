import { spawn, ChildProcess } from 'child_process';
import { Service } from '../shared/types';
import { ConfigManager } from './ConfigManager';

export class ServiceManager {
  private configManager: ConfigManager;
  private processes: Map<string, ChildProcess>;
  private startTimes: Map<string, number>;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.processes = new Map();
    this.startTimes = new Map();
  }

  startService(serviceId: string): boolean {
    const service = this.configManager.getService(serviceId);
    if (!service) {
      console.error(`Service ${serviceId} not found`);
      return false;
    }

    if (service.status === 'running') {
      console.log(`Service ${serviceId} is already running`);
      return false;
    }

    try {
      // Update status to starting
      service.status = 'starting';
      
      // Spawn the process
      const childProcess = spawn(service.command, {
        cwd: service.cwd,
        shell: true,
        detached: false
      });

      // Store process
      this.processes.set(serviceId, childProcess);
      this.startTimes.set(serviceId, Date.now());
      service.pid = childProcess.pid;

      // Handle stdout
      childProcess.stdout?.on('data', (data: Buffer) => {
        this.handleLog(serviceId, 'INFO', data.toString());
      });

      // Handle stderr
      childProcess.stderr?.on('data', (data: Buffer) => {
        this.handleLog(serviceId, 'ERROR', data.toString());
      });

      // Handle process exit
      childProcess.on('exit', (code) => {
        this.handleExit(serviceId, code);
      });

      // Handle errors
      childProcess.on('error', (error) => {
        console.error(`Error starting service ${serviceId}:`, error);
        service.status = 'crashed';
      });

      // Mark as running after 1 second (if still alive)
      setTimeout(() => {
        if (childProcess.killed === false && childProcess.exitCode === null) {
          service.status = 'running';
          console.log(`Service ${serviceId} started successfully`);
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error(`Failed to start service ${serviceId}:`, error);
      service.status = 'crashed';
      return false;
    }
  }

  stopService(serviceId: string): boolean {
  const service = this.configManager.getService(serviceId);
  if (!service) return false;

  const childProcess = this.processes.get(serviceId);
  if (!childProcess) {
    service.status = 'stopped';
    return true;
  }

  try {
    // Kill the process
    if (childProcess.pid) {
      // On Windows, use taskkill to kill process tree
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', childProcess.pid.toString(), '/T', '/F']);
      } else {
        // On Unix, kill process group
        childProcess.kill('SIGTERM');
      }
    }

    this.processes.delete(serviceId);
    this.startTimes.delete(serviceId);
    service.status = 'stopped';
    service.pid = undefined;
    
    console.log(`Service ${serviceId} stopped`);
    return true;
  } catch (error) {
    console.error(`Error stopping service ${serviceId}:`, error);
    return false;
  }
}

  restartService(serviceId: string): boolean {
    this.stopService(serviceId);
    // Wait a bit before restarting
    setTimeout(() => {
      this.startService(serviceId);
    }, 1000);
    return true;
  }

  private handleLog(serviceId: string, level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
    // TODO: Pass to LogManager
    console.log(`[${serviceId}] [${level}] ${message.trim()}`);
  }

  private handleExit(serviceId: string, code: number | null): void {
    const service = this.configManager.getService(serviceId);
    if (!service) return;

    this.processes.delete(serviceId);
    this.startTimes.delete(serviceId);
    
    if (code === 0) {
      // Normal exit
      service.status = 'stopped';
      console.log(`Service ${serviceId} exited normally`);
    } else {
      // Crashed
      service.status = 'crashed';
      console.log(`Service ${serviceId} crashed with code ${code}`);
      
      // Auto-restart if enabled
      if (service.autoRestart) {
        console.log(`Auto-restarting service ${serviceId}...`);
        setTimeout(() => {
          this.startService(serviceId);
        }, 2000);
      }
    }
  }

  // Get service stats
  getServiceUptime(serviceId: string): string {
    const startTime = this.startTimes.get(serviceId);
    if (!startTime) return '0s';

    const uptime = Date.now() - startTime;
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Stop all services on app quit
  stopAll(): void {
    const services = this.configManager.getAllServices();
    services.forEach(service => {
      if (service.status === 'running') {
        this.stopService(service.id);
      }
    });
  }
}