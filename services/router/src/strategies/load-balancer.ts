import { RoutingStrategy } from './routing.interface';
import { Device, SMSTask } from '@sms-relay/types';

/**
 * LeastLoadedStrategy: Selects the device with the highest SMS quota
 * remaining to distribute load evenly across the network.
 */
export class LeastLoadedStrategy implements RoutingStrategy {
  name = 'least-loaded';

  findBestDevice(task: SMSTask, availableDevices: Device[]): Device | null {
    if (availableDevices.length === 0) return null;

    return availableDevices.reduce((prev, curr) =>
      (prev.smsRemaining > curr.smsRemaining) ? prev : curr
    );
  }
}

/**
 * GeoMatchStrategy: Prioritizes devices within the same region/operator
 * as the destination to increase delivery rates.
 */
export class GeoMatchStrategy implements RoutingStrategy {
  name = 'geo-match';

  findBestDevice(task: SMSTask, availableDevices: Device[]): Device | null {
    // In a real implementation, task would contain destination country/operator info
    // This is a simplified mock
    return availableDevices[0] || null;
  }
}
