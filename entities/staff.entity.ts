export type StaffStatus = 'active' | 'terminated' | 'resigned' | 'suspended' | 'on-leave' | 'archived';

export interface StaffEntity {
  staffId: string;
  identity: {
    personnelNo: string;
    employeeId?: string;
    cnic?: string;
  };
  personal: {
    fullName: string;
    fatherName?: string;
    dob?: string;
    gender?: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    nationality?: string;
    religion?: string;
    maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    photo?: string;
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
    role?: string;
    employmentType?: string;
    joiningDate?: string;
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
    cnicFront?: string;
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
  status: StaffStatus;
  campus?: string;
  category?: string;
  statusHistory?: {
    fromStatus: string;
    toStatus: string;
    changedAt: string;
    changedBy: string;
    reason?: string;
  }[];
  metadata: {
    version: number;
    source?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: any;
    updatedAt?: any;
  };

  // @deprecated legacy fields
  id?: string;
  tenantId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: any;
  updatedAt?: any;
  deletedAt?: any;
}

export interface StaffTimelineEntry {
  date: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}
