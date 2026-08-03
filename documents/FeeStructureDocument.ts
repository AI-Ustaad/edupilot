export interface FeeStructureDocument {
  id?: string;
  name: string;
  feeType: "Admission" | "Tuition" | "Hostel" | "Transport" | "Library" | "Lab" | "Other";
  amount: number;
  frequency: "One-Time" | "Monthly" | "Termly" | "Annual";
  classId?: string;
  tenantId: string;
  deleted: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: any;
  updatedAt?: any;
  metadata?: {
    version?: number;
    createdBy?: string;
    updatedBy?: string;
    source?: string;
  };
  [key: string]: any;
}
