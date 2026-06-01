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
    allowances?: {
      houseRent?: number;
      medical?: number;
      transport?: number;
    };
    grossSalary?: number;
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
}
