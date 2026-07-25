// dto/StudentResponseDTO.ts
import type { StudentStatus } from "@/entities/student.entity";

export interface StudentResponseDTO {
  id: string;
  studentId: string;
  fullName: string;
  firstName: string;
  lastName?: string;
  classGrade: string;
  section: string;
  rollNumber?: number;
  admissionNumber?: string;
  cnic?: string;
  gender: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  status: StudentStatus;
  avatarUrl?: string;
  metadata?: any;
}
