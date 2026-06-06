export interface StudentProfile {
  id: string;
  fullName: string;          // Changed from firstName/lastName to match your DB
  fatherName?: string;
  cnic?: string;
  dob?: string;
  gender?: string;
  religion?: string;
  nationality?: string;
  phone?: string;
  address?: string;
  classGrade: string;        // Changed from class to classGrade
  section?: string;
  rollNumber: string | number;
  admissionNumber?: string;
  previousSchool?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  photoBase64?: string;      // Brought back the Base64 image support
  status?: 'Active' | 'Inactive' | 'Suspended';
  admissionDate?: string;
}

export interface Student360Data {
  profile: StudentProfile;
  healthScore: number;
}
