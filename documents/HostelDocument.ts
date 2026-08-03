export interface HostelDocument {
  id?: string;
  name: string;
  buildingId?: string;
  capacity: number;
  occupied: number;
  type: "Boys" | "Girls" | "Mixed";
    supervisorId?: string;
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
