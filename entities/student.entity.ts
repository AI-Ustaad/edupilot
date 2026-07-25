// entities/StudentEntity.ts

export type StudentStatus = "Active" | "Suspended" | "Graduated" | "StruckOff" | "OnLeave";

export interface StudentComment {
  id: string;
  comment: string;
  commentedBy: string;
  commentedAt: string;
  type: string;
}

export interface StudentEntity {
  // Immutable Identifier
  studentId: string;
  
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
    primaryParentId?: string | null;
    emergencyContactPhone?: string;
  };
  
  contacts?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  guardian?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  medical?: {
    bloodGroup?: string;
    conditions?: string;
  };
  demographics?: {
    religion?: string;
    nationality?: string;
    previousSchool?: string;
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

  comments?: StudentComment[];

  // --- @deprecated --- 
  // TODO: Remove after Migration v2
  id?: string;
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
}
// --- Legacy Types (Moved from types/student.ts) ---
export interface TimelineEntry {
  date: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
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
