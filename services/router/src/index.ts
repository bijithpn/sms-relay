import { Device, SMSTask } from '@sms-relay/types';
import { RoutingStrategy } from './strategies/routing.interface';
import { LeastLoadedStrategy, GeoMatchStrategy } from './strategies/load-balancer';

export class RoutingEngine {
  private strategies: Map<string, RoutingStrategy> = new Map();
  private currentStrategy: string = 'least-loaded';

  constructor() {
    this.strategies.set('least-loaded', new LeastLoadedStrategy());
    this.strategies.set('geo-match', new GeoMatchStrategy());
  }

  setStrategy(name: string) {
    if (this.strategies.has(name)) {
      this.currentStrategy = name;
    }
  }

  async routeTask(task: SMSTask, availableDevices: Device[]): Promise<Device | null> {
    const strategy = this.strategies.get(this.currentStrategy);
    if (!strategy) throw new Error('Routing strategy not found');

    console.log(`Routing task ${task.id} using strategy: ${strategy.name}`);
    return strategy.findBestDevice(task, availableDevices);
  }

  async preventSpamBans(deviceId: string, targetNumber: string): Promise<boolean> {
    return true;
  }
}
