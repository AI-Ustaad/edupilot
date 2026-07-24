// entities/student.entity.ts

export type StudentStatus = "Active" | "Suspended" | "Graduated" | "StruckOff" | "OnLeave";

export interface StudentDocument {
  id?: string;
  admissionNumber?: string;
  rollNumber?: string;
  cnic?: string;
  fullName?: string;
  gender?: string;
  dob?: string;
  photoBase64?: string;
  classGrade?: string;
  section?: string;
  admissionDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  religion?: string;
  nationality?: string;
  previousSchool?: string;
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
  [key: string]: any;
}

export interface StudentComment {
  id: string;
  comment: string;
  commentedBy: string;
  commentedAt: string;
  type: string;
}

export interface StudentEntity {
  studentId: string;
  id?: string;
  
  identity: {
    admissionNumber: string;
    rollNumber?: number;
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

  // ✅ Added Comments Array
  comments?: StudentComment[];

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
  rollNumber?: string;
  cnic?: string;
  primaryParentId?: string | null;
  tenantId?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

// --- Legacy Types ---
export interface PromotionRecord {
  fromClass: string;
  fromSection: string;
  toClass: string;
  toSection: string;
  academicYear: string;
  promotedAt: string;
  promotedBy: string;
}

export interface StudentFile {
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
