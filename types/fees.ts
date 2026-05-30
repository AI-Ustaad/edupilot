// types/fees.ts
export interface Fee {
  id: string;
  tenantId: string;
  studentId: string;
  studentName?: string;
  rollNumber?: number;
  classGrade?: string;
  feeMonth: string;           // e.g. "April 2026"
  amountPaid: number;
  paymentMethod: "Cash" | "Bank Transfer" | "Online / JazzCash";
  remarks?: string;
  createdAt: Date;
  updatedAt?: Date;
}
