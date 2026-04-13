export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  phone: string;
  walletBalance: number;
  role: UserRole;
  createdAt: Date;
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
}

export interface Device {
  id: string;
  userId: string;
  phoneNumber: string;
  simOperator: string;
  smsRemaining: number;
  status: DeviceStatus;
  lastSeen: Date;
}

export enum SMSJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface SMSJob {
  id: string;
  clientId: string;
  message: string;
  totalCount: number;
  status: SMSJobStatus;
  createdAt: Date;
}

export enum SMSTaskStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export interface SMSTask {
  id: string;
  jobId: string;
  assignedDeviceId: string | null;
  status: SMSTaskStatus;
  retryCount: number;
}
