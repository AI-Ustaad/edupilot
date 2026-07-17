// interfaces/IHomeworkRepository.ts
import type { Homework } from "@/types/homework";

export interface IHomeworkRepository {
  findAll(tenantId: string): Promise<(Homework & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Homework & { id: string }) | null>;
  create(data: Omit<Homework, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Homework>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
}
