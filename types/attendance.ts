// types/attendance.ts
export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Leave"
  | "Late"
  | "HalfDay"
  | "Holiday";

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: number;
  classGrade: string;
  section: string;
  date: string;               // YYYY-MM-DD
  status: AttendanceStatus;
  period?: string;            // e.g. "Period 1" for period-wise attendance
  remarks?: string;
  lateMinutes?: number;       // How many minutes late (if status = "Late")
  approvedBy?: string;        // Teacher/admin who approved
  leaveRequestId?: string;    // Link to leave request if applicable
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}
