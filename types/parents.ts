// types/parents.ts
export interface Parent {
  id: string;            // userId (Uid of parent)
  tenantId: string;
  studentIds: string[];
  name?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt?: Date;
}
