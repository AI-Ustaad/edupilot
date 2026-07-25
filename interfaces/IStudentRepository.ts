// interfaces/IStudentRepository.ts
import type { StudentDocument } from "@/documents/StudentDocument";

export interface IStudentRepository {
  create(document: StudentDocument, tenantId: string): Promise<string>;
  save(document: StudentDocument, tenantId: string): Promise<StudentDocument>;
  update(id: string, document: Partial<StudentDocument>, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<StudentDocument | null>;
  findByRollNumber(rollNumber: string, tenantId: string): Promise<StudentDocument | null>;
  paginate(tenantId: string, page: number, limit: number): Promise<{ data: StudentDocument[]; total: number; page: number; totalPages: number }>;
  softDelete(id: string, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  // search & advancedFilter will be added here in Phase 6
}
