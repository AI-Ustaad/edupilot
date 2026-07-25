// documents/StudentDocument.ts

export interface StudentDocument {
  id?: string;
  
  // Identity
  admissionNumber?: string;
  rollNumber?: string; // Stored as string in Firestore
  cnic?: string;
  
  // Personal
  fullName?: string;
  gender?: string;
  dob?: string;
  photoBase64?: string;
  
  // Academic
  classGrade?: string;
  section?: string;
  admissionDate?: string;
  
  // Contacts
  phone?: string;
  email?: string;
  address?: string;
  
  // Guardian
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  emergencyContactPhone?: string;
  
  // Medical
  bloodGroup?: string;
  medicalConditions?: string;
  
  // Demographics
  religion?: string;
  nationality?: string;
  previousSchool?: string;
  
  // System
  status?: string;
  primaryParentId?: string | null;
  tenantId?: string;
  admissionStatus?: string;
  deleted?: boolean;
  
  metadata?: {
    version?: number;
    createdBy?: string;
    updatedBy?: string;
    source?: string;
    createdAt?: any;
    updatedAt?: any;
  };
  
    comments?: Array<{
    id: string;
    comment: string;
    commentedBy: string;
    commentedAt: string;
    type: string;
  }>;

  // 🚀 Added for backward compatibility
  [key: string]: any;
}
