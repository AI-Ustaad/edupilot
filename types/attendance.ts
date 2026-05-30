// types/attendance.ts
export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: number;
  classGrade: string;
  section: string;
  date: string;               // YYYY-MM-DD
  status: "Present" | "Absent" | "Leave";
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}
