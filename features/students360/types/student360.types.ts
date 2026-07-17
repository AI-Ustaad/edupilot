// Re-export canonical types from types/student.ts for backward compatibility
import type { Student, TimelineEntry } from "@/types/student";

export interface StudentProfile {
  id: string;
  fullName: string;
  fatherName?: string;
  cnic?: string;
  dob?: string;
  gender?: string;
  religion?: string;
  nationality?: string;
  phone?: string;
  address?: string;
  classGrade: string;
  section?: string;
  rollNumber: string | number;
  admissionNumber?: string;
  previousSchool?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  photoBase64?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  admissionDate?: string;
}

export interface Student360Data {
  profile: StudentProfile;
  healthScore: number;
}
