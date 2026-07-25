export interface AttendanceDocument {
  id?: string;
  studentId: string;
  studentName?: string;
  rollNumber?: number;
  classGrade: string;
  section: string;
  date: string;
  status: string;
  period?: string;
  remarks?: string;
  lateMinutes?: number;
  approvedBy?: string;
  leaveRequestId?: string;
  tenantId?: string;
  createdBy?: string;
  metadata?: {
    version?: number;
    source?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: any;
    updatedAt?: any;
  };
  [key: string]: any;
}
