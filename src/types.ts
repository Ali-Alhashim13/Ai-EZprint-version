import { LucideIcon } from 'lucide-react';

export type UserRole = 'ADMIN' | 'SUB_ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  balance: number;
  totalPagesPrinted: number;
  totalJobsSubmitted: number;
  restricted: boolean;
  department?: string;
}

export interface Printer {
  id: string;
  name: string;
  location: string;
  status: 'ACTIVE' | 'OFFLINE' | 'PAPER_JAM' | 'LOW_TONER';
  type: 'PHYSICAL' | 'VIRTUAL';
  pageCost: number;
  totalPagesPrinted: number;
  totalJobsSubmitted: number;
}

export interface PrintJob {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  status: 'PENDING' | 'PRINTED' | 'CANCELLED' | 'DELETED';
  submittedAt: string;
  printedAt?: string;
  printerId?: string;
  attributes: {
    color: boolean;
    duplex: boolean;
  };
  cost: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'PRINT_DEDUCTION' | 'REFUND' | 'CREDIT_ADDITION' | 'ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  timestamp: string;
  comment?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  userId?: string;
  source: string;
}
