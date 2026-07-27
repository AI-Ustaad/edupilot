// interfaces/IHomeworkService.ts
import type { Homework } from "@/types/homework";

export interface IHomeworkService {
  createHomework(data: unknown, tenantId: string, userId: string): Promise<Homework>;
  listHomework(tenantId: string): Promise<Homework[]>;
  getById(id: string, tenantId: string): Promise<Homework | null>;
  updateHomework(id: string, data: unknown, tenantId: string, userId: string): Promise<Homework>;
  deleteHomework(id: string, tenantId: string, userId: string): Promise<void>;
}
