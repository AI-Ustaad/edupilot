export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  registrationNo: string;
  class: string;
  section: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  admissionDate: string;
  profileImage?: string;
}

export interface Student360Data {
  profile: StudentProfile;
  healthScore: number;
}
