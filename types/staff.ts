export interface Staff {
  id: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;

  personal: {
    fullName: string;
    fatherName?: string;
    cnic?: string;
    dob?: string;               // YYYY-MM-DD
    gender?: "Male" | "Female" | "Other";
    bloodGroup?: string;
    nationality?: string;
    religion?: string;
    maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
    photo?: string;             // URL
  };

  contact: {
    mobile?: string;
    whatsapp?: string;
    email?: string;
    currentAddress?: string;
    permanentAddress?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };

  professional: {
    personnelNo: string;
    employeeId?: string;
    designation: string;
    department?: string;
    role?: string;              // e.g. Teacher, Admin, etc.
    employmentType?: string;
    joiningDate?: string;       // YYYY-MM-DD
    confirmationDate?: string;
    experience?: string;
    qualification?: string;
  };

  payroll?: {
    basicSalary?: number;
    allowances?: { name: string; amount: number }[];
    deductions?: { name: string; amount: number }[];
    grossSalary?: number;
    netSalary?: number;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    salaryPaymentMethod?: string;
  };

  academic?: {
    subjects?: string[];
    classesAssigned?: string[];
    timetable?: string;
    sectionAssignment?: string;
    classTeacher?: boolean;
  };

  attendance?: {
    presentDays?: number;
    absentDays?: number;
    lateArrivals?: number;
    leaves?: number;
    attendancePercent?: number;
  };

  leaves?: {
    casualLeaves?: number;
    medicalLeaves?: number;
    annualLeaves?: number;
    remainingLeaves?: number;
  };

  documents?: {
    cnicFront?: string;         // URL
    cnicBack?: string;
    degreeCertificates?: string[];
    experienceCertificates?: string[];
    appointmentLetter?: string;
    contract?: string;
    cv?: string;
  };

  emergency?: {
    name?: string;
    relation?: string;
    phone?: string;
    alternatePhone?: string;
  };

  performance?: {
    score?: number;
    principalRemarks?: string;
    warnings?: number;
    achievements?: string[];
    promotions?: string[];
    trainingHistory?: string[];
  };

  status?: 'active' | 'terminated' | 'resigned' | 'suspended' | 'on-leave' | 'archived';
  campus?: string;
  category?: string;
  statusHistory?: StatusChangeRecord[];
}

export interface StatusChangeRecord {
  fromStatus: string;
  toStatus: string;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface StaffFilter {
  category?: string;
  department?: string;
  designation?: string;
  status?: string;
  campus?: string;
  gender?: string;
  employmentType?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: 'asc' | 'desc';
}

export interface StaffAnalytics {
  total: number;
  active: number;
  terminated: number;
  resigned: number;
  onLeave: number;
  byDepartment: Record<string, number>;
  byCategory: Record<string, number>;
  byCampus: Record<string, number>;
  byGender: Record<string, number>;
}

export interface StaffTimelineEntry {
  date: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}
