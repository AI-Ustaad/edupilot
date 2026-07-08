// dto/CreateStaffDTO.ts
import { CreateStaffInput } from "@/validators/staff/CreateStaffValidator";

export interface CreateStaffDTO {
  personal: {
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
  admissionMethod?: string;
  tenantId: string;
  createdBy: string;
}
