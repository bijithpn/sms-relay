import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import localtunnel from 'localtunnel';
import * as os from 'os';

export type ConnectionMode = 'local' | 'ngrok' | 'cloudflare';

@Injectable()
export class TunnelService implements OnModuleDestroy {
  private tunnel: any = null;
  private publicUrl: string | null = null;
  private activeMode: ConnectionMode = 'local';
  private readonly logger = new Logger(TunnelService.name);

  async startTunnel(mode: ConnectionMode, port: number, manualUrl?: string): Promise<string> {
    await this.stopTunnel();
    this.activeMode = mode;

    if (manualUrl) {
      this.publicUrl = manualUrl;
      this.logger.log(`Manual ${mode} URL set: ${this.publicUrl}`);
      return this.publicUrl;
    }

    if (mode === 'local') {
      this.publicUrl = `http://${this.getLanIp()}:${port}`;
      this.logger.log(`Local network URL selected: ${this.publicUrl}`);
      return this.publicUrl;
    }

    try {
      this.logger.log(`Starting localtunnel for port ${port}...`);
      this.tunnel = await localtunnel({ port });
      this.publicUrl = this.tunnel.url;
      
      this.tunnel.on('close', () => {
        this.tunnel = null;
        this.publicUrl = null;
      });

      return this.publicUrl!;
    } catch (err) {
      this.logger.error('Failed to start automatic tunnel:', err);
      throw err;
    }
  }

  getStatus() {
    return {
      mode: this.activeMode,
      url: this.publicUrl,
    };
  }

  async stopTunnel() {
    if (this.tunnel) {
      await this.tunnel.close();
      this.tunnel = null;
    }
    this.publicUrl = null;
    this.activeMode = 'local';
  }

  onModuleDestroy() {
    this.stopTunnel();
  }

  private getLanIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (!iface) continue;
      for (const alias of iface) {
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
    return '127.0.0.1';
  }
}
