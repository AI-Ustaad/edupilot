// types/student.ts
export interface Student {
  id: string;
  fullName: string;
  fatherName?: string;
  motherName?: string;
  classGrade: string;
  section: string;
  rollNumber: number;
  cnic?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  phone?: string;
  email?: string;
  address?: string;
  tenantId: string;
  createdBy?: string;
  updatedBy?: string;
  teacherComment?: string;
  admissionStatus?: string;
  admissionNumber?: string;
  admissionMethod?: string;
  academicYear?: string;
  previousClass?: string;
  previousSection?: string;
  promotedAt?: Date;
  promotedBy?: string;
  deleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  // ERP fields
  photoBase64?: string;
  bloodGroup?: string;
  nationality?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  medicalConditions?: string;
  house?: string;
  transportRouteId?: string;
  hostelId?: string;
  status?: 'active' | 'graduated' | 'transferred' | 'suspended' | 'archived' | 'dropped';
  promotionHistory?: PromotionRecord[];
  documents?: StudentDocument[];
}

export interface PromotionRecord {
  fromClass: string;
  fromSection: string;
  toClass: string;
  toSection: string;
  academicYear: string;
  promotedAt: string;
  promotedBy: string;
}

export interface StudentDocument {
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
  student: Student & { id: string };
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
