// interfaces/ITimetableService.ts
import type { TimetableEntry } from "@/types/timetable";

export interface ITimetableService {
  listEntries(tenantId: string): Promise<(TimetableEntry & { id: string })[]>;
  createEntry(data: unknown, tenantId: string, userId?: string): Promise<string>;
  deleteEntry(id: string, tenantId: string, userId?: string): Promise<void>;
}
