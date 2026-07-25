export interface AttendanceEntity {
  attendanceId: string;
  studentId: string;
  studentName?: string;
  rollNumber?: number;
  classGrade: string;
  section: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Late" | "HalfDay" | "Holiday";
  period?: string;
  remarks?: string;
  lateMinutes?: number;
  approvedBy?: string;
  leaveRequestId?: string;
  metadata: {
    version: number;
    source?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: any;
    updatedAt?: any;
  };

  id?: string;
  tenantId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: any;
  updatedAt?: any;
}
