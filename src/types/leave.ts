// src/types/leave.ts
export interface Comment {
  userId?: {
    name: string;
  } | null;
  role?: string;
  text: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  replacement?: string;
  emergencyContact?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  comments?: Comment[];
  employeeName?: string;
  attachmentUrl?: string;
  doctorCertificate?: string;
}