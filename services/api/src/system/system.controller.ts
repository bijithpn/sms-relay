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
    const requiredTables = ['templates', 'sms_tasks', 'devices', 'users'];
    const rows = await this.dataSource.query(
      `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name = any($1)
      `,
      [requiredTables],
    );
    const existingTables = rows.map((row: { table_name: string }) => row.table_name);
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table));

    return {
      api: 'online',
      database: this.dataSource.isInitialized ? 'connected' : 'disconnected',
      synchronize: true,
      tablesReady: missingTables.length === 0,
      existingTables,
      missingTables,
      message:
        missingTables.length === 0
          ? 'API, database, and required tables are ready.'
          : 'Database is connected, but some tables are missing. Restart the API so TypeORM synchronize can create them.',
    };
  }

  @Get('ip')
  getNetworkIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (!iface) continue;
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return { ip: alias.address };
        }
      }
    }
    return { ip: '127.0.0.1' };
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
