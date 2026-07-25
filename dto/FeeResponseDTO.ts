export interface FeeResponseDTO {
  id: string;
  feeId: string;
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
  metadata?: any;
}
