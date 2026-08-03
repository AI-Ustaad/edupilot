export interface GradingDocument {
  id?: string;
  name: string;
  gradingType: "Percentage" | "Grade" | "Point" | "Letter";
  scale: { min: number; max: number; grade: string; gradePoint: number }[];
  passingScore: number;
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
