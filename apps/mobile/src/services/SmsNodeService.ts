import { Device, SMSTask } from '@sms-relay/types';
import { GLOBAL_CONFIG } from '@sms-relay/config';
import { io, Socket } from 'socket.io-client';

export class SMSNodeService {
  private socket: Socket | null = null;
  private deviceId: string | null = null;

  async initialize(deviceId: string) {
    this.deviceId = deviceId;
    this.socket = io(process.env.API_URL || 'http://localhost:3000');

    this.socket.on('sms-task', async (task: SMSTask) => {
      console.log(`Received SMS Task: ${task.id}`);
      const success = await this.sendSMS(task);
      this.reportStatus(task.id, success ? 'SENT' : 'FAILED');
    });

    // Start heartbeat to keep device status ONLINE in the router
    this.startHeartbeat();
  }

  private async sendSMS(task: SMSTask): Promise<<booleanboolean> {
    try {
      console.log(`Native SMS Call: Sending message to ${task.jobId}`);
      // In reality, this calls the Native Module:
      // await NativeSmsModule.sendSms({ number: task.target, message: task.text });
      return true;
    } catch (e) {
      console.error('SMS Sending Failed', e);
      return false;
    }
  }

  private reportStatus(taskId: string, status: string) {
    this.socket?.emit('task-status-update', { taskId, status });
  }

  private startHeartbeat() {
    setInterval(() => {
      this.socket?.emit('heartbeat', {
        deviceId: this.deviceId,
        smsRemaining: 100 // Mock value from native SIM check
      });
    }, GLOBAL_CONFIG.HEARTBEAT_INTERVAL_MS);
  }

  disconnect() {
    this.socket?.disconnect();
  }
}
