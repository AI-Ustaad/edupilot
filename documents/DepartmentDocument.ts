export interface DepartmentDocument {
  id?: string;
  name: string;
  code: string;
  headOfDepartment?: string;
  description: string;
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
