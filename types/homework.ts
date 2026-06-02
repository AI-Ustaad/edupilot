// types/homework.ts
export interface Homework {
  id: string;
  title: string;
  description: string;
  classGrade: string;       // e.g., "10"
  section: string;          // e.g., "A"
  subject: string;          // e.g., "Mathematics"
  dueDate?: string;         // YYYY-MM-DD
  createdBy: string;        // teacher UID
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
}
