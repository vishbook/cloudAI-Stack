import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  uptime: number;
  loadAverage: number[];
}

export interface ResourceMetrics {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  };
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
}

export interface ServiceInfo {
  name: string;
  status: 'active' | 'inactive' | 'failed' | 'unknown';
  enabled: boolean;
  description?: string;
}

export class InfrastructureAgent {
  private static instance: InfrastructureAgent;

  static getInstance(): InfrastructureAgent {
    if (!InfrastructureAgent.instance) {
      InfrastructureAgent.instance = new InfrastructureAgent();
    }
    return InfrastructureAgent.instance;
  }

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const { stdout: hostname } = await execAsync('hostname');
      const { stdout: uptime } = await execAsync('uptime');
      
      // Parse uptime to get load averages
      const uptimeMatch = uptime.match(/load average[s]?: ([0-9.]+),?\s*([0-9.]+),?\s*([0-9.]+)/);
      const loadAverage = uptimeMatch ? 
        [parseFloat(uptimeMatch[1]), parseFloat(uptimeMatch[2]), parseFloat(uptimeMatch[3])] : 
        [0, 0, 0];

      return {
        hostname: hostname.trim(),
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        loadAverage
      };
    } catch (error) {
      console.error('Error getting system info:', error);
      return {
        hostname: 'unknown',
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        loadAverage: [0, 0, 0]
      };
    }
  }

  async getResourceMetrics(): Promise<ResourceMetrics> {
    try {
      const [cpuInfo, memInfo, diskInfo, networkInfo] = await Promise.all([
        this.getCPUMetrics(),
        this.getMemoryMetrics(),
        this.getDiskMetrics(),
        this.getNetworkMetrics()
      ]);

      return {
        cpu: cpuInfo,
        memory: memInfo,
        disk: diskInfo,
        network: networkInfo
      };
    } catch (error) {
      console.error('Error getting resource metrics:', error);
      throw error;
    }
  }

  private async getCPUMetrics() {
    try {
      // Get CPU usage using top command
      const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | sed 's/%us,//'");
      const usage = parseFloat(stdout.trim()) || 0;

      // Get CPU info
      const { stdout: cpuInfo } = await execAsync("lscpu | grep 'Model name' | cut -d':' -f2");
      const model = cpuInfo.trim() || 'Unknown CPU';

      // Get number of cores
      const { stdout: coreInfo } = await execAsync("nproc");
      const cores = parseInt(coreInfo.trim()) || 1;

      return {
        usage,
        cores,
        model
      };
    } catch (error) {
      console.error('Error getting CPU metrics:', error);
      return {
        usage: 0,
        cores: 1,
        model: 'Unknown CPU'
      };
    }
  }

  private async getMemoryMetrics() {
    try {
      const { stdout } = await execAsync("free -b | grep '^Mem:'");
      const parts = stdout.trim().split(/\s+/);
      
      const total = parseInt(parts[1]) || 0;
      const used = parseInt(parts[2]) || 0;
      const free = parseInt(parts[3]) || 0;
      const usage = total > 0 ? (used / total) * 100 : 0;

      return {
        total,
        used,
        free,
        usage
      };
    } catch (error) {
      console.error('Error getting memory metrics:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        usage: 0
      };
    }
  }

  private async getDiskMetrics() {
    try {
      const { stdout } = await execAsync("df -B1 / | tail -1");
      const parts = stdout.trim().split(/\s+/);
      
      const total = parseInt(parts[1]) || 0;
      const used = parseInt(parts[2]) || 0;
      const free = parseInt(parts[3]) || 0;
      const usage = total > 0 ? (used / total) * 100 : 0;

      return {
        total,
        used,
        free,
        usage
      };
    } catch (error) {
      console.error('Error getting disk metrics:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        usage: 0
      };
    }
  }

  private async getNetworkMetrics() {
    try {
      // Try to get network stats from /proc/net/dev
      const data = await fs.readFile('/proc/net/dev', 'utf8');
      const lines = data.split('\n');
      
      let totalBytesReceived = 0;
      let totalBytesSent = 0;
      let totalPacketsReceived = 0;
      let totalPacketsSent = 0;

      for (const line of lines) {
        if (line.includes(':') && !line.includes('lo:')) { // Skip loopback
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 10) {
            totalBytesReceived += parseInt(parts[1]) || 0;
            totalPacketsReceived += parseInt(parts[2]) || 0;
            totalBytesSent += parseInt(parts[9]) || 0;
            totalPacketsSent += parseInt(parts[10]) || 0;
          }
        }
      }

      return {
        bytesReceived: totalBytesReceived,
        bytesSent: totalBytesSent,
        packetsReceived: totalPacketsReceived,
        packetsSent: totalPacketsSent
      };
    } catch (error) {
      console.error('Error getting network metrics:', error);
      return {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0
      };
    }
  }

  async getRunningProcesses(limit: number = 10): Promise<ProcessInfo[]> {
    try {
      // Get top processes by CPU usage
      const { stdout } = await execAsync(`ps aux --sort=-%cpu | head -n ${limit + 1} | tail -n ${limit}`);
      const lines = stdout.trim().split('\n');
      
      return lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          pid: parseInt(parts[1]) || 0,
          name: parts[10] || 'unknown',
          cpu: parseFloat(parts[2]) || 0,
          memory: parseFloat(parts[3]) || 0,
          status: parts[7] || 'unknown'
        };
      });
    } catch (error) {
      console.error('Error getting running processes:', error);
      return [];
    }
  }

  async getSystemServices(): Promise<ServiceInfo[]> {
    try {
      // Try to get systemd services
      const { stdout } = await execAsync('systemctl list-units --type=service --state=active,failed --no-pager --no-legend');
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      
      return lines.slice(0, 20).map(line => {
        const parts = line.trim().split(/\s+/);
        const name = parts[0]?.replace('.service', '') || 'unknown';
        const status = parts[2] === 'active' ? 'active' : 
                     parts[2] === 'failed' ? 'failed' : 'inactive';
        
        return {
          name,
          status: status as ServiceInfo['status'],
          enabled: true, // Simplified for now
          description: parts.slice(4).join(' ') || undefined
        };
      });
    } catch (error) {
      console.error('Error getting system services:', error);
      return [];
    }
  }

  async executeCommand(command: string, timeout: number = 30000): Promise<{ stdout: string; stderr: string; success: boolean }> {
    try {
      const { stdout, stderr } = await execAsync(command, { timeout });
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: true
      };
    } catch (error: any) {
      return {
        stdout: '',
        stderr: error.message || 'Command execution failed',
        success: false
      };
    }
  }

  async restartService(serviceName: string): Promise<{ success: boolean; message: string }> {
    try {
      const { stderr } = await execAsync(`sudo systemctl restart ${serviceName}`);
      if (stderr) {
        return { success: false, message: stderr };
      }
      return { success: true, message: `Service ${serviceName} restarted successfully` };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to restart service' };
    }
  }

  async checkPortAvailability(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`netstat -tuln | grep :${port}`);
      return stdout.trim() === ''; // Empty means port is available
    } catch (error) {
      return true; // Assume available if command fails
    }
  }

  async getDockerContainers(): Promise<any[]> {
    try {
      const { stdout } = await execAsync('docker ps --format "table {{.ID}}\\t{{.Image}}\\t{{.Command}}\\t{{.CreatedAt}}\\t{{.Status}}\\t{{.Ports}}\\t{{.Names}}"');
      const lines = stdout.trim().split('\n');
      
      if (lines.length <= 1) return []; // No containers or just header
      
      return lines.slice(1).map(line => {
        const parts = line.split('\t');
        return {
          id: parts[0] || '',
          image: parts[1] || '',
          command: parts[2] || '',
          created: parts[3] || '',
          status: parts[4] || '',
          ports: parts[5] || '',
          name: parts[6] || ''
        };
      });
    } catch (error) {
      // Docker might not be installed or accessible
      return [];
    }
  }
}

export const agent = InfrastructureAgent.getInstance();