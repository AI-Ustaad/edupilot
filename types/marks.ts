// types/marks.ts
export interface Mark {
  studentId: string;
  studentName?: string;
  classGrade: string;
  section: string;
  term: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  skills?: Record<string, number>;
  tenantId: string;
  deleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
