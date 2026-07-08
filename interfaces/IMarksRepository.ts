// interfaces/IMarksRepository.ts
import { Mark } from "@/types/marks";

export interface IMarksRepository {
  findAll(tenantId: string): Promise<(Mark & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Mark & { id: string }) | null>;
  findWithFilters(tenantId: string, filters?: { classGrade?: string; section?: string; term?: string; subject?: string; studentId?: string }): Promise<Mark[]>;
  create(data: Omit<Mark, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Mark>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  upsert(id: string, data: Partial<Mark>, tenantId: string): Promise<void>;
  getDb(): FirebaseFirestore.Firestore;
  getCollectionName(): string;
}
