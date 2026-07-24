// entities/student.entity.ts

export type StudentStatus = "Active" | "Suspended" | "Graduated" | "StruckOff" | "OnLeave";

/**
 * Persistence Model (Firestore Flat Document)
 */
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
  [key: string]: any; // Allow other legacy fields if they exist
}

/**
 * Domain Entity (Enterprise Aggregate)
 */
export interface StudentEntity {
  // Immutable Identifier
  studentId: string;
  id?: string; // Legacy compatibility for older code using student.id
  
  // --- Enterprise Domain Aggregate ---
  identity: {
    admissionNumber: string;
    rollNumber?: number; // Always Number in Domain
    cnicOrBForm?: string;
  };
  personal: {
    firstName: string;
    lastName?: string;
    gender: "Male" | "Female" | "Other";
    dateOfBirth?: string;
    avatarUrl?: string;
  };
  academic: {
    campusId: string;
    classId: string;
    sectionId: string;
    admissionDate: string;
  };
  parentReferences: {
    primaryParentId: string;
    emergencyContactPhone?: string;
  };
  status: StudentStatus;
  
  // 🟢 Relations (References Only - No Data Duplication)
  runtimeRelations: {
    activeFeeInvoices: string[];
    recentAttendanceState: "Present" | "Absent" | "Late" | "HalfDay" | null;
    busRouteId?: string;
    hostelRoomId?: string;
  };

  metadata: {
    version: number;
    source?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: any;
    updatedAt?: any;
  };

  // --- TODO: Remove after Student Module Migration v2 ---
  // Legacy Compatibility Fields
  fullName?: string;
  fatherName?: string;
  classGrade?: string;
  section?: string;
  phone?: string;
  email?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  dob?: string;
  gender?: string;
  photoBase64?: string;
  religion?: string;
  nationality?: string;
  previousSchool?: string;
  admissionNumber?: string;
  rollNumber?: string; // Legacy string representation
  cnic?: string;
  primaryParentId?: string | null;
  tenantId?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any; // Allow any other legacy fields to prevent TS errors
}

// --- Legacy Types (Kept to avoid breaking imports) ---
export interface PromotionRecord {
  fromClass: string;
  fromSection: string;
  toClass: string;
  toSection: string;
  academicYear: string;
  promotedAt: string;
  promotedBy: string;
}

export interface StudentFile { // Renamed from StudentDocument to avoid clash
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface StudentFilter {
  classGrade?: string;
  section?: string;
  gender?: string;
  status?: string;
  house?: string;
  feeStatus?: string;
  attendanceMin?: number;
  attendanceMax?: number;
  riskLevel?: string;
  academicYear?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: 'asc' | 'desc';
}

export interface Student360Aggregate {
  student: StudentEntity & { id: string };
  attendance: { present: number; absent: number; late: number; percentage: number };
  fees: { totalDue: number; totalPaid: number; outstanding: number; records: any[] };
  marks: { exams: any[]; average: number; trend: string };
  behavior: { logs: any[]; incidents: number };
  transport: any | null;
  hostel: any | null;
  timeline: TimelineEntry[];
  aiSummary?: string;
}

export interface TimelineEntry {
  date: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface StudentAnalytics {
  total: number;
  active: number;
  graduated: number;
  transferred: number;
  suspended: number;
  archived: number;
  dropped: number;
  byClass: Record<string, number>;
  bySection: Record<string, Record<string, number>>;
  byGender: Record<string, number>;
  byHouse: Record<string, number>;
  riskCount: number;
}
