export interface FeeEntity {
  feeId: string;
  identity: {
    studentId: string;
    studentName?: string;
    rollNumber?: number;
    email?: string;
  };
  financial: {
    classGrade?: string;
    feeMonth: string;
    amountPaid: number;
    paymentMethod: string;
    dueDate?: string;
    status?: string;
    remarks?: string;
  };
  metadata: {
    version: number;
    source?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: any;
    updatedAt?: any;
  };

  id?: string;
  tenantId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: any;
  updatedAt?: any;
}
