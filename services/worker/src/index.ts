import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { SMSTask } from '@sms-saas/types';
import { GLOBAL_CONFIG } from '@sms-saas/config';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const smsQueue = new Queue('sms-tasks', { connection });

export const smsWorker = new Worker(
  'sms-tasks',
  async (job: Job<<SMSMSTask>) => {
    console.log(`Processing SMS Task: ${job.id}`);

    try {
      // 1. Validate Task State
      if (job.attempts >= GLOBAL_CONFIG.RETRY_LIMIT) {
        throw new Error('Max retries reached');
      }

      // 2. Trigger Routing / Dispatch
      // In a real scenario, this would communicate with the Router service
      // or send a message via WebSocket to the assigned device.
      await dispatchToDevice(job.data);

      return { status: 'DISPATCHED', taskId: job.data.id };
    } catch (error) {
      console.error(`Task ${job.data.id} failed: ${error.message}`);
      throw error; // Allow BullMQ to handle retry
    }
  },
  { connection }
);

async function dispatchToDevice(task: SMSTask) {
  console.log(`Dispatching task ${task.id} to device ${task.assignedDeviceId}`);
  // Logic to send via WebSocket/Push Notification to the Android device
}
