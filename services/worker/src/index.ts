import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { SMSTask } from '@sms-saas/types';
import { GLOBAL_CONFIG } from '@sms-saas/config';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

connection.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('❌ Redis Connection Refused at', err.address, ':', err.port);
    console.error('👉 Ensure Redis is running: `docker-compose up -d redis`');
  }
});

connection.on('connect', () => {
  console.log('✅ Worker connected to Redis');
});

export const smsQueue = new Queue('sms-tasks', { connection });

export const smsWorker = new Worker(
  'sms-tasks',
  async (job) => {
    const task = job.data as SMSTask;
    console.log(`Processing SMS Task: ${job.id}`);

    try {
      // BullMQ Job attempts are available on the job object
      const attempts = (job as any).attempts;
      if (attempts && attempts >= GLOBAL_CONFIG.RETRY_LIMIT) {
        throw new Error('Max retries reached');
      }

      await dispatchToDevice(task);

      return { status: 'DISPATCHED', taskId: task.id };
    } catch (error: any) {
      console.error(`Task ${task?.id} failed: ${error.message}`);
      throw error;
    }
  },
  { connection }
);

async function dispatchToDevice(task: SMSTask) {
  console.log(`Dispatching task ${task.id} to device ${task.assignedDeviceId}`);
}
