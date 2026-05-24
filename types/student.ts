// types/student.ts
export interface Student {
  id: string;
  fullName: string;
  fatherName?: string;
  classGrade: string;
  section: string;
  rollNumber: number;
  cnic?: string;
  phone?: string;
  email?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
}
