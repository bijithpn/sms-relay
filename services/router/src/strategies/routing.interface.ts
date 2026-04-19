import { Device, SMSTask } from "@sms-relay/types";

export interface RoutingStrategy {
  name: string;
  findBestDevice(task: SMSTask, availableDevices: Device[]): Device | null;
}
