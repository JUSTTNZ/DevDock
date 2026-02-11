import { spawn, ChildProcess } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import pidtree from 'pidtree';
import pidusage from 'pidusage';
import { Service } from '../shared/types';
import { ConfigManager } from './ConfigManager';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

const MAX_LOGS_PER_SERVICE = 500;
const MAX_AUTO_RESTARTS = 3;
const RESTART_WINDOW_MS = 60_000; // reset crash count after 1 minute of stable running

export class ServiceManager {
  private configManager: ConfigManager;
  private processes: Map<string, ChildProcess>;
  private startTimes: Map<string, number>;
  private logs: Map<string, LogEntry[]>;
  private crashCounts: Map<string, { count: number; firstCrash: number }>;
  private manuallyStopped: Set<string>;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.processes = new Map();
    this.startTimes = new Map();
    this.logs = new Map();
    this.crashCounts = new Map();
    this.manuallyStopped = new Set();
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
      this.manuallyStopped.delete(serviceId);

      // Clean up stale Next.js dev lock file if present
      this.cleanupStaleLockFiles(service);

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

    // Mark as manually stopped so auto-restart doesn't kick in
    this.manuallyStopped.add(serviceId);
    this.crashCounts.delete(serviceId);

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

  private cleanupStaleLockFiles(service: Service): void {
    const lockPath = join(service.cwd, '.next', 'dev', 'lock');
    if (existsSync(lockPath)) {
      try {
        unlinkSync(lockPath);
        this.handleLog(service.id, 'WARN', 'Removed stale .next/dev/lock file');
      } catch {
        // Lock file may be held by a running process — leave it
      }
    }
  }

  private handleLog(serviceId: string, level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (!this.logs.has(serviceId)) {
      this.logs.set(serviceId, []);
    }

    const entries = this.logs.get(serviceId)!;
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    entries.push({ timestamp, level, message: trimmed });

    // Cap stored logs
    if (entries.length > MAX_LOGS_PER_SERVICE) {
      entries.splice(0, entries.length - MAX_LOGS_PER_SERVICE);
    }

    console.log(`[${serviceId}] [${level}] ${trimmed}`);
  }

  getLogs(serviceId: string): LogEntry[] {
    return this.logs.get(serviceId) || [];
  }

  clearLogs(serviceId: string): void {
    this.logs.set(serviceId, []);
  }

  private handleExit(serviceId: string, code: number | null): void {
    const service = this.configManager.getService(serviceId);
    if (!service) return;

    this.processes.delete(serviceId);
    this.startTimes.delete(serviceId);

    // If manually stopped, don't auto-restart
    if (this.manuallyStopped.has(serviceId)) {
      service.status = 'stopped';
      console.log(`Service ${serviceId} stopped by user`);
      return;
    }

    if (code === 0) {
      // Normal exit
      service.status = 'stopped';
      console.log(`Service ${serviceId} exited normally`);
    } else {
      // Crashed
      service.status = 'crashed';
      console.log(`Service ${serviceId} crashed with code ${code}`);

      // Auto-restart if enabled, with retry limit
      if (service.autoRestart) {
        const now = Date.now();
        let crashInfo = this.crashCounts.get(serviceId);

        if (!crashInfo || (now - crashInfo.firstCrash > RESTART_WINDOW_MS)) {
          // First crash or window expired — reset
          crashInfo = { count: 1, firstCrash: now };
        } else {
          crashInfo.count++;
        }
        this.crashCounts.set(serviceId, crashInfo);

        if (crashInfo.count <= MAX_AUTO_RESTARTS) {
          const delay = crashInfo.count * 3000; // 3s, 6s, 9s backoff
          console.log(`Auto-restarting service ${serviceId} (attempt ${crashInfo.count}/${MAX_AUTO_RESTARTS}) in ${delay / 1000}s...`);
          this.handleLog(serviceId, 'WARN',
            `Auto-restarting (attempt ${crashInfo.count}/${MAX_AUTO_RESTARTS}) in ${delay / 1000}s...`);
          setTimeout(() => {
            this.startService(serviceId);
          }, delay);
        } else {
          console.log(`Service ${serviceId} crashed ${crashInfo.count} times in ${RESTART_WINDOW_MS / 1000}s — auto-restart disabled`);
          this.handleLog(serviceId, 'ERROR',
            `Crashed ${crashInfo.count} times — auto-restart stopped. Fix the issue and start manually.`);
        }
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

  // Update live metrics on all services
  async updateServiceStats(): Promise<void> {
    const services = this.configManager.getAllServices();
    for (const service of services) {
      // Always update uptime from start times
      if (service.status === 'running' || service.status === 'starting') {
        service.uptime = this.getServiceUptime(service.id);
      } else {
        service.uptime = '0s';
      }

      // Get CPU/memory from pidusage across the entire process tree
      const proc = this.processes.get(service.id);
      if (proc && proc.pid && service.status === 'running') {
        try {
          const pids = await pidtree(proc.pid, { root: true });
          const statsMap = await pidusage(pids);
          let totalCpu = 0;
          let totalMem = 0;
          for (const pid of pids) {
            if (statsMap[pid]) {
              totalCpu += statsMap[pid].cpu;
              totalMem += statsMap[pid].memory;
            }
          }
          const memMB = totalMem / (1024 * 1024);
          service.memory = memMB >= 1024
            ? `${(memMB / 1024).toFixed(1)} GB`
            : `${Math.round(memMB)} MB`;
          service.cpu = `${totalCpu.toFixed(1)}%`;
        } catch {
          // Process may have just exited
          service.memory = '0 MB';
          service.cpu = '0%';
        }
      } else {
        service.memory = '0 MB';
        service.cpu = '0%';
      }
    }
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