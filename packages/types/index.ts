export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  phone: string;
  walletBalance: number;
  role: UserRole;
  createdAt: Date;
}

export interface Device {
  id: string;
  userId: string;
  phoneNumber: string;
  simOperator: string;
  smsRemaining: number;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  lastSeen: Date;
}

export interface SMSJob {
  id: string;
  clientId: string;
  message: string;
  totalCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

export interface SMSTask {
  id: string;
  jobId: string;
  assignedDeviceId: string | null;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  retryCount: number;
}
