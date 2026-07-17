// types/timetable.ts
export interface TimetableEntry {
  day: string;
  period: string;
  subject: string;
  classGrade: string;
  teacher: string;
  meetingLink?: string;
  tenantId: string;
  createdAt: Date;
}
