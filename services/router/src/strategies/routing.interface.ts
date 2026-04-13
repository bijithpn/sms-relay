import { Device, SMSTask } from '@sms-saas/types';

export interface RoutingStrategy {
  name: string;
  findBestDevice(task: SMSTask, availableDevices: Device[]): Device | null;
}
