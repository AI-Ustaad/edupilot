// interfaces/IMarksService.ts
import type { Mark } from "@/types/marks";

export interface IMarksService {
  saveMark(data: unknown, tenantId: string, userId: string): Promise<{ id: string; message: string }>;
  listMarks(tenantId: string, filters?: { classGrade?: string; section?: string; term?: string; subject?: string; studentId?: string }): Promise<(Mark & { id: string })[]>;
  findByStudent(tenantId: string, studentId: string): Promise<(Mark & { id: string })[]>;
  deleteMark(id: string, tenantId: string, userId: string): Promise<void>;
  saveSkills(data: unknown, tenantId: string, userId: string): Promise<void>;
  getSkills(tenantId: string, studentId: string, term?: string): Promise<Record<string, number>[]>;
  getAggregatedResults(tenantId: string, classGrade: string, section: string, term: string): Promise<{ studentId: string; studentName: string; rollNumber: string | number; marks: (Mark & { id: string })[]; totalObtained: number; totalMax: number; percentage: string; grade: string }[]>;
  publishResults(data: unknown, tenantId: string, userId: string): Promise<{ students: number; emailsSent: number }>;
}
