export interface ParentEntity {
  parentId: string;
  identity: {
    userId: string;
  };
  personal: {
    fullName: string;
    email?: string;
    phone?: string;
  };
  relationships: {
    studentIds: string[];
  };
  metadata: {
    version: number;
    source?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: any;
    updatedAt?: any;
  };

  id?: string;
  tenantId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: any;
  updatedAt?: any;
}
