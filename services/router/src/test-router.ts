import { RoutingEngine } from './index';
import { Device, SMSTask, DeviceStatus, SMSTaskStatus } from '@sms-relay/types';

const router = new RoutingEngine();

// Mock Data for Testing
const mockDevices: Device[] = [
  { id: 'd1', userId: 'u1', phoneNumber: '+123', simOperator: 'Verizon', smsRemaining: 50, status: DeviceStatus.ONLINE, lastSeen: new Date() },
  { id: 'd2', userId: 'u2', phoneNumber: '+456', simOperator: 'T-Mobile', smsRemaining: 150, status: DeviceStatus.ONLINE, lastSeen: new Date() },
  { id: 'd3', userId: 'u3', phoneNumber: '+789', simOperator: 'AT&T', smsRemaining: 20, status: DeviceStatus.ONLINE, lastSeen: new Date() },
];

const mockTask: SMSTask = {
  id: 't1',
  jobId: 'j1',
  assignedDeviceId: null,
  status: SMSTaskStatus.PENDING,
  retryCount: 0
};

async function testRouting() {
  console.log('Testing Least Loaded Strategy...');
  const bestDevice = await router.routeTask(mockTask, mockDevices);
  console.log(`Best device selected: ${bestDevice?.id} (Remaining: ${bestDevice?.smsRemaining})`);
}

testRouting();
