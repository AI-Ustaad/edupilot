// interfaces/IBookRepository.ts
import type { Book } from "@/types/teacher";

export interface IBookRepository {
  findAll(tenantId: string): Promise<(Book & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Book & { id: string }) | null>;
  create(data: Omit<Book, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Book>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  findByFilter(tenantId: string, filters: { classGrade?: string; subject?: string }): Promise<(Book & { id: string })[]>;
}
