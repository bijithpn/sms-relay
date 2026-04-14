import { Controller, Get, Post, Body } from '@nestjs/common';
import * as os from 'os';
import { TunnelService } from './tunnel.service';

@Controller('system')
export class SystemController {
  constructor(private readonly tunnelService: TunnelService) {}

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
