// interfaces/IParentRepository.ts
import { Parent } from "@/types/parents";

export interface IParentRepository {
  findAll(tenantId: string): Promise<(Parent & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Parent & { id: string }) | null>;
  create(data: Omit<Parent, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Parent>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  paginate(
    tenantId: string,
    page: number,
    limit: number,
    orderBy?: string,
    direction?: "asc" | "desc"
  ): Promise<{ data: (Parent & { id: string })[]; total: number; page: number; totalPages: number }>;
}
