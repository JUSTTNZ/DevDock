import { spawn, execSync, ChildProcess } from 'child_process';
import { existsSync, unlinkSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { createServer, Socket } from 'net';
import { shell } from 'electron';
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
const RESTART_WINDOW_MS = 60_000;

// Check if a port is free by trying to listen on it briefly
function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

// Wait ms milliseconds
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if a port is free, retrying a few times with delay (handles Windows TIME_WAIT)
async function isPortFreeWithRetry(port: number, retries = 3, delayMs = 1000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    if (await isPortFree(port)) return true;
    if (i < retries - 1) await delay(delayMs);
  }
  return false;
}

// Find the next free port starting from the given port
async function findFreePort(startPort: number): Promise<number> {
  let port = startPort;
  const maxAttempts = 50;
  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortFree(port)) return port;
    port++;
  }
  // Fallback: let the OS pick
  return 0;
}

// Check if a port is accepting connections (i.e. service is ready)
function isPortReady(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(300);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

// Poll a port until it's ready, then run a callback
async function waitForPortReady(
  port: number,
  onReady: () => void,
  shouldStop: () => boolean,
  maxWaitMs = 120_000
): Promise<void> {
  const start = Date.now();
  const pollInterval = 500;
  while (Date.now() - start < maxWaitMs) {
    if (shouldStop()) return;
    if (await isPortReady(port)) {
      onReady();
      return;
    }
    await delay(pollInterval);
  }
}

export class ServiceManager {
  private configManager: ConfigManager;
  private processes: Map<string, ChildProcess>;
  private startTimes: Map<string, number>;
  private logs: Map<string, LogEntry[]>;
  private crashCounts: Map<string, { count: number; firstCrash: number }>;
  private manuallyStopped: Set<string>;
  private activePorts: Map<string, number>; // serviceId -> actual port in use
  private lastStats: Map<string, { cpu: string; memory: string }>;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.processes = new Map();
    this.startTimes = new Map();
    this.logs = new Map();
    this.crashCounts = new Map();
    this.manuallyStopped = new Set();
    this.activePorts = new Map();
    this.lastStats = new Map();
  }

  async startService(serviceId: string): Promise<boolean> {
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
      service.status = 'starting';
      this.manuallyStopped.delete(serviceId);

      // Clean up stale lock files
      this.cleanupStaleLockFiles(service);

      // Resolve port conflicts
      const configuredPort = service.port;
      let assignedPort = configuredPort;
      const env: Record<string, string> = { ...process.env } as Record<string, string>;

      if (configuredPort) {
        // First check if another managed service owns this port
        const managedConflict = this.checkManagedPortConflict(serviceId, configuredPort);

        if (managedConflict) {
          // Another managed service is actively using this port — find a free one
          const freePort = await findFreePort(configuredPort + 1);
          if (freePort > 0) {
            this.handleLog(serviceId, 'WARN',
              `⚠ Port ${configuredPort} is in use by "${managedConflict}". Using port ${freePort} instead.`);
            assignedPort = freePort;
            env['PORT'] = String(freePort);
          }
        } else {
          // Retry the configured port a few times (handles Windows TIME_WAIT after stop)
          const portFree = await isPortFreeWithRetry(configuredPort, 3, 1000);
          if (!portFree) {
            // Port is genuinely in use by something external — find a free one
            const freePort = await findFreePort(configuredPort + 1);
            if (freePort > 0) {
              this.handleLog(serviceId, 'WARN',
                `⚠ Port ${configuredPort} is in use by another process. Using port ${freePort} instead.`);
              assignedPort = freePort;
              env['PORT'] = String(freePort);
            } else {
              this.handleLog(serviceId, 'WARN',
                `⚠ Port ${configuredPort} is in use and no free port found nearby. The service may pick its own port.`);
            }
          }
        }
      }

      // Track the runtime port (never overwrite the configured port in config)
      if (assignedPort) {
        this.activePorts.set(serviceId, assignedPort);
      }
      service.activePort = assignedPort;

      // Spawn the process with the (possibly updated) environment
      const childProcess = spawn(service.command, {
        cwd: service.cwd,
        shell: true,
        detached: false,
        env
      });

      this.processes.set(serviceId, childProcess);
      this.startTimes.set(serviceId, Date.now());
      service.pid = childProcess.pid;

      childProcess.stdout?.on('data', (data: Buffer) => {
        this.handleLog(serviceId, 'INFO', data.toString());
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        this.handleLog(serviceId, 'ERROR', data.toString());
      });

      childProcess.on('exit', (code) => {
        this.handleExit(serviceId, code);
      });

      childProcess.on('error', (error) => {
        console.error(`Error starting service ${serviceId}:`, error);
        service.status = 'crashed';
      });

      // If the service has a port, poll until it's accepting connections
      if (assignedPort) {
        const portToCheck = assignedPort;
        waitForPortReady(
          portToCheck,
          () => {
            if (childProcess.killed || childProcess.exitCode !== null) return;
            service.status = 'running';
            console.log(`Service ${serviceId} is ready on port ${portToCheck}`);
            this.handleLog(serviceId, 'INFO', `✓ Service is ready — opening http://localhost:${portToCheck}`);
            // Auto-launch the browser
            shell.openExternal(`http://localhost:${portToCheck}`);
          },
          () => childProcess.killed || childProcess.exitCode !== null
        );
      } else {
        // No port configured — mark as running after 1 second
        setTimeout(() => {
          if (childProcess.killed === false && childProcess.exitCode === null) {
            service.status = 'running';
            console.log(`Service ${serviceId} started successfully`);
          }
        }, 1000);
      }

      return true;
    } catch (error) {
      console.error(`Failed to start service ${serviceId}:`, error);
      service.status = 'crashed';
      return false;
    }
  }

  // Check if another managed service is actively using this port
  private checkManagedPortConflict(serviceId: string, port: number): string | null {
    for (const [otherId, otherPort] of this.activePorts) {
      if (otherId !== serviceId && otherPort === port) {
        const otherService = this.configManager.getService(otherId);
        if (otherService && (otherService.status === 'running' || otherService.status === 'starting')) {
          return otherService.name;
        }
      }
    }
    return null;
  }

  async stopService(serviceId: string): Promise<boolean> {
    const service = this.configManager.getService(serviceId);
    if (!service) return false;

    this.manuallyStopped.add(serviceId);
    this.crashCounts.delete(serviceId);
    this.activePorts.delete(serviceId);

    const childProcess = this.processes.get(serviceId);
    if (!childProcess) {
      service.status = 'stopped';
      return true;
    }

    try {
      if (childProcess.pid) {
        if (process.platform === 'win32') {
          // Wait for taskkill to fully terminate the process tree
          await new Promise<void>((resolve) => {
            const kill = spawn('taskkill', ['/pid', childProcess.pid!.toString(), '/T', '/F']);
            kill.on('close', () => resolve());
            kill.on('error', () => resolve());
            // Safety timeout — don't hang forever
            setTimeout(() => resolve(), 5000);
          });
        } else {
          childProcess.kill('SIGTERM');
          // Give SIGTERM a moment, then force kill if still alive
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              try { childProcess.kill('SIGKILL'); } catch {}
              resolve();
            }, 3000);
            childProcess.on('exit', () => {
              clearTimeout(timeout);
              resolve();
            });
          });
        }
      }

      this.processes.delete(serviceId);
      this.startTimes.delete(serviceId);
      service.status = 'stopped';
      service.pid = undefined;
      service.activePort = undefined;

      console.log(`Service ${serviceId} stopped`);
      return true;
    } catch (error) {
      console.error(`Error stopping service ${serviceId}:`, error);
      return false;
    }
  }

  async restartService(serviceId: string): Promise<boolean> {
    await this.stopService(serviceId);
    await this.startService(serviceId);
    return true;
  }

  private cleanupStaleLockFiles(service: Service): void {
    const lockPaths = [
      join(service.cwd, '.next', 'dev', 'lock'),
      join(service.cwd, '.next', 'lockfile'),
      join(service.cwd, '.next', 'build-lock'),
    ];

    for (const lockPath of lockPaths) {
      if (existsSync(lockPath)) {
        try {
          unlinkSync(lockPath);
          this.handleLog(service.id, 'WARN', `Removed stale lock: ${lockPath}`);
        } catch {
          try {
            rmSync(lockPath, { force: true });
            this.handleLog(service.id, 'WARN', `Force-removed lock: ${lockPath}`);
          } catch { /* */ }
        }
      }
    }

    const nextDir = join(service.cwd, '.next');
    if (existsSync(nextDir)) {
      try {
        const entries = readdirSync(nextDir);
        for (const entry of entries) {
          if (entry.endsWith('.lock') || entry === 'lock') {
            const p = join(nextDir, entry);
            try {
              rmSync(p, { force: true });
              this.handleLog(service.id, 'WARN', `Removed lock file: .next/${entry}`);
            } catch { /* */ }
          }
        }
      } catch { /* */ }
    }

    const devDir = join(service.cwd, '.next', 'dev');
    if (existsSync(devDir)) {
      try {
        const entries = readdirSync(devDir);
        for (const entry of entries) {
          if (entry.endsWith('.lock') || entry === 'lock') {
            const p = join(devDir, entry);
            try {
              rmSync(p, { force: true });
              this.handleLog(service.id, 'WARN', `Removed lock file: .next/dev/${entry}`);
            } catch { /* */ }
          }
        }
      } catch { /* */ }
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
    this.activePorts.delete(serviceId);

    if (this.manuallyStopped.has(serviceId)) {
      service.status = 'stopped';
      console.log(`Service ${serviceId} stopped by user`);
      return;
    }

    if (code === 0) {
      service.status = 'stopped';
      console.log(`Service ${serviceId} exited normally`);
    } else {
      service.status = 'crashed';
      console.log(`Service ${serviceId} crashed with code ${code}`);

      if (service.autoRestart) {
        const now = Date.now();
        let crashInfo = this.crashCounts.get(serviceId);

        if (!crashInfo || (now - crashInfo.firstCrash > RESTART_WINDOW_MS)) {
          crashInfo = { count: 1, firstCrash: now };
        } else {
          crashInfo.count++;
        }
        this.crashCounts.set(serviceId, crashInfo);

        if (crashInfo.count <= MAX_AUTO_RESTARTS) {
          const delay = crashInfo.count * 5000;
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

  // Get CPU usage for a process tree on Windows using wmic
  private getWindowsCpuUsage(pid: number): number {
    try {
      // Get all PIDs in the tree
      let pids: number[] = [pid];
      try {
        const wmicTree = execSync(
          `wmic process where (ParentProcessId=${pid}) get ProcessId /format:csv`,
          { timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }
        ).toString();
        const childPids = wmicTree
          .split('\n')
          .map(line => line.trim().split(',').pop())
          .filter(Boolean)
          .map(Number)
          .filter(n => !isNaN(n) && n > 0);
        if (childPids.length > 0) pids = [pid, ...childPids];
      } catch { /* use just the main pid */ }

      // Get CPU time for all PIDs using a single wmic call
      const pidFilter = pids.map(p => `ProcessId=${p}`).join(' OR ');
      const output = execSync(
        `wmic process where "${pidFilter}" get ProcessId,PercentProcessorTime /format:csv`,
        { timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString();

      // wmic PercentProcessorTime is not always available; fall back to kernel+user time delta
      // Try alternative: use PowerShell Get-Process which gives CPU seconds
      const psOutput = execSync(
        `powershell -NoProfile -Command "Get-Process -Id ${pids.join(',')} -ErrorAction SilentlyContinue | Select-Object -Property Id,CPU | ConvertTo-Csv -NoTypeInformation"`,
        { timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString();

      let totalCpuSeconds = 0;
      const lines = psOutput.split('\n').slice(1); // skip header
      for (const line of lines) {
        const parts = line.trim().replace(/"/g, '').split(',');
        if (parts.length >= 2) {
          const cpuSeconds = parseFloat(parts[1]);
          if (!isNaN(cpuSeconds)) totalCpuSeconds += cpuSeconds;
        }
      }

      return totalCpuSeconds;
    } catch {
      return -1;
    }
  }

  async updateServiceStats(): Promise<void> {
    const services = this.configManager.getAllServices();
    for (const service of services) {
      if (service.status === 'running' || service.status === 'starting') {
        service.uptime = this.getServiceUptime(service.id);
      } else {
        service.uptime = '0s';
      }

      // Attach runtime port info
      service.activePort = this.activePorts.get(service.id) || undefined;

      const proc = this.processes.get(service.id);
      if (proc && proc.pid && service.status === 'running') {
        let totalCpu = 0;
        let totalMem = 0;
        let gotStats = false;

        // Try 1: get full process tree stats via pidtree + pidusage
        try {
          const pids = await pidtree(proc.pid, { root: true });
          const statsMap = await pidusage(pids);
          for (const pid of pids) {
            if (statsMap[pid]) {
              totalCpu += statsMap[pid].cpu;
              totalMem += statsMap[pid].memory;
            }
          }
          gotStats = totalMem > 0;
        } catch {
          // pidtree can fail on Windows shell-spawned processes
        }

        // Try 2: fall back to just the main PID
        if (!gotStats) {
          try {
            const stats = await pidusage(proc.pid);
            if (stats) {
              totalCpu = stats.cpu;
              totalMem = stats.memory;
              gotStats = true;
            }
          } catch {
            // pidusage failed for this PID too
          }
        }

        // On Windows, if CPU is 0 but process is running, use PowerShell-based CPU delta
        if (gotStats && totalCpu === 0 && process.platform === 'win32') {
          const prevSnapshot = this.lastStats.get(service.id);
          const cpuSeconds = this.getWindowsCpuUsage(proc.pid);
          const now = Date.now();

          if (cpuSeconds >= 0 && prevSnapshot && (prevSnapshot as any)._cpuSeconds !== undefined) {
            const prevCpuSeconds = (prevSnapshot as any)._cpuSeconds as number;
            const prevTime = (prevSnapshot as any)._time as number;
            const elapsedSec = (now - prevTime) / 1000;
            if (elapsedSec > 0) {
              totalCpu = ((cpuSeconds - prevCpuSeconds) / elapsedSec) * 100;
              if (totalCpu < 0) totalCpu = 0;
            }
          }

          // Store snapshot for next delta calculation
          if (cpuSeconds >= 0) {
            const existing = this.lastStats.get(service.id) || { cpu: '0%', memory: '0 MB' };
            (existing as any)._cpuSeconds = cpuSeconds;
            (existing as any)._time = now;
            this.lastStats.set(service.id, existing);
          }
        }

        if (gotStats) {
          const memMB = totalMem / (1024 * 1024);
          service.memory = memMB >= 1024
            ? `${(memMB / 1024).toFixed(1)} GB`
            : `${Math.round(memMB)} MB`;
          service.cpu = `${totalCpu.toFixed(1)}%`;
          const statsEntry = this.lastStats.get(service.id) || { cpu: '0%', memory: '0 MB' };
          statsEntry.cpu = service.cpu;
          statsEntry.memory = service.memory;
          this.lastStats.set(service.id, statsEntry);
        } else {
          // pidusage failed — use last known good values instead of resetting to 0
          const cached = this.lastStats.get(service.id);
          if (cached) {
            service.cpu = cached.cpu;
            service.memory = cached.memory;
          } else {
            service.memory = '0 MB';
            service.cpu = '0%';
          }
        }
      } else {
        // Service is not running — reset to 0 and clear cache
        service.memory = '0 MB';
        service.cpu = '0%';
        this.lastStats.delete(service.id);
      }
    }
  }

  async stopAll(): Promise<void> {
    const services = this.configManager.getAllServices();
    await Promise.all(
      services
        .filter(service => service.status === 'running')
        .map(service => this.stopService(service.id))
    );
  }
}
