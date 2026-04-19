import { Queue, QueueOptions } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

export const createQueue = (name: string, options?: QueueOptions) => {
  return new Queue(name, { ...options, connection });
};
