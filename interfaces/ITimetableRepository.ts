// interfaces/ITimetableRepository.ts
import { TimetableEntry } from "@/types/timetable";

export interface ITimetableRepository {
  findAll(tenantId: string): Promise<(TimetableEntry & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(TimetableEntry & { id: string }) | null>;
  create(data: Omit<TimetableEntry, "id" | "createdAt">, tenantId: string): Promise<string>;
  delete(id: string, tenantId: string): Promise<void>;
}
