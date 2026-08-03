export interface FacilityDocument {
  id?: string;
  name: string;
  type: "Grounds" | "Lab" | "Sports" | "AudioVisual" | "Medical" | "Canteen" | "Prayer" | "Other";
  description: string;
  capacity: number;
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
