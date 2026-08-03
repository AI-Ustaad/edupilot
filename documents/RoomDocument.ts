export interface RoomDocument {
  id?: string;
  name: string;
  buildingId?: string;
  capacity: number;
  type: "Classroom" | "Laboratory" | "Auditorium" | "Library" | "Office" | "Storage" | "Other";
  features: string[];
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
