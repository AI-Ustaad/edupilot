// types/staff.ts
export interface Staff {
  id: string;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;   // soft delete

  personal: {
    fullName: string;
    fatherName?: string;
    cnic?: string;
    dob?: string;
    gender?: "Male" | "Female" | "Other";
    maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
    email?: string;
    phone?: string;
    currentAddress?: string;
    permanentAddress?: string;
    emergencyContact?: string;
    photo?: string;
  };

  professional: {
    personnelNo: string;
    doj?: string;
    bps?: string;
    empCategory?: "Active Permanent" | "Contract" | "Visiting" | "Retired";
    designation: string;
    ddoCode?: string;
    prevExperience?: string;
    prevInstitution?: string;
  };

  financial?: {
    bankName?: string;
    accountNo?: string;
    accountTitle?: string;
    ntn?: string;
  };

  education?: Array<{
    level: string;
    institute: string;
    passingYear: string;
    subjects: string;
    document?: string;
  }>;

  allowances?: Array<{
    name: string;
    amount: number;
  }>;

  deductions?: Array<{
    name: string;
    amount: number;
  }>;
}
