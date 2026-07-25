export interface ParentDocument {
  id?: string;
  userId: string;
  studentIds: string[];
  name?: string;
  email?: string;
  phone?: string;
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
