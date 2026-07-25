export interface StaffResponseDTO {
  id: string;
  staffId: string;
  fullName: string;
  fatherName?: string;
  cnic?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  maritalStatus?: string;
  photo?: string;
  mobile?: string;
  email?: string;
  designation: string;
  department?: string;
  role?: string;
  status: string;
  campus?: string;
  category?: string;
  metadata?: any;
}
