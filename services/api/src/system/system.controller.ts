import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as os from 'os';
import { TunnelService } from './tunnel.service';

@Controller('system')
export class SystemController {
  constructor(
    private readonly tunnelService: TunnelService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('health')
  async getHealth() {
    if (!this.dataSource?.isInitialized) {
      return {
        api: 'online',
        database: 'connecting',
        message: 'Database is still initializing...'
      };
    }

    try {
      const requiredTables = ['templates', 'sms_tasks', 'devices', 'users', 'otps', 'recipients'];
      // Use a simpler approach to check tables without raw SQL if possible
      // but raw SQL is fine if we handle it correctly.
      const rows = await this.dataSource.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\''
      );
      
      const existingTables = rows.map((r: any) => r.table_name);
      const missingTables = requiredTables.filter((table) => !existingTables.includes(table));

      return {
        api: 'online',
        database: 'connected',
        synchronize: true,
        tablesReady: missingTables.length === 0,
        existingTables,
        missingTables,
        message:
          missingTables.length === 0
            ? 'API and database are healthy.'
            : `Missing tables: ${missingTables.join(', ')}. They will be created automatically on restart.`,
      };
    } catch (error: any) {
      return {
        api: 'online',
        database: 'error',
        message: `Status check failed: ${error.message}`,
      };
    }
  }

  @Get('ip')
  getNetworkIp() {
    const interfaces = os.networkInterfaces();
    let bestIp = '127.0.0.1';
    
    // priority scoring for IPs
    const getScore = (ip: string, name: string) => {
      let score = 0;
      if (ip.startsWith('192.168.')) score += 100;
      if (ip.startsWith('10.')) score += 90;
      if (ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) score += 80;
      
      const lowerName = name.toLowerCase();
      if (lowerName.includes('wi-fi') || lowerName.includes('wifi') || lowerName.includes('wlan')) score += 50;
      if (lowerName.includes('ethernet') || lowerName.includes('eth')) score += 40;
      if (lowerName.includes('virtual') || lowerName.includes('vbox') || lowerName.includes('vmware') || lowerName.includes('hyper')) score -= 200;
      if (lowerName.includes('tailscale') || lowerName.includes('zerotier')) score -= 100;
      
      return score;
    };

    let maxScore = -999;

    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (!iface) continue;
      for (const alias of iface) {
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          const score = getScore(alias.address, devName);
          if (score > maxScore) {
            maxScore = score;
            bestIp = alias.address;
          }
        }
      }
    }
    return { ip: bestIp };
  }

  @Get('tunnel')
  getTunnelStatus() {
    return this.tunnelService.getStatus();
  }

  @Post('tunnel/start')
  async startTunnel(@Body() body: { mode: 'local' | 'ngrok' | 'cloudflare', port?: number, url?: string }) {
    const port = body.port || 3000;
    const url = await this.tunnelService.startTunnel(body.mode, port, body.url);
    return { url, mode: body.mode };
  }

  @Post('tunnel/stop')
  async stopTunnel() {
    await this.tunnelService.stopTunnel();
    return { status: 'stopped' };
  }
}
