import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import localtunnel from 'localtunnel';

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
}
