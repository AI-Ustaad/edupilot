// types/fees.ts
export interface Fee {
  id: string;
  tenantId: string;
  studentId: string;
  studentName?: string;
  email?: string;                // 👈 نیا – والدین کا ای میل
  rollNumber?: number;
  classGrade?: string;
  feeMonth: string;
  amountPaid: number;
  paymentMethod: "Cash" | "Bank Transfer" | "Online / JazzCash";
  remarks?: string;
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;                // 👈 نیا – مقررہ تاریخ
  status?: string;               // 👈 نیا – "pending", "paid", وغیرہ
}
