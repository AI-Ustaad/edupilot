export interface FeeDocument {
  id?: string;
  studentId: string;
  studentName?: string;
  email?: string;
  rollNumber?: number;
  classGrade?: string;
  feeMonth: string;
  amountPaid: number;
  paymentMethod: string;
  remarks?: string;
  dueDate?: string;
  status?: string;
  tenantId?: string;
  metadata?: {
    version?: number;
    source?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: any;
    updatedAt?: any;
  };
  [key: string]: any;
}
