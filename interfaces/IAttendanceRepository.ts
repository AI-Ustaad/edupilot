// interfaces/IAttendanceRepository.ts
import { Attendance } from "@/types/attendance";
import type { Firestore } from "firebase-admin/firestore";

export interface IAttendanceRepository {
  findAll(tenantId: string): Promise<(Attendance & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Attendance & { id: string }) | null>;
  findWithFilters(tenantId: string, filters?: {
    date?: string;
    classGrade?: string;
    section?: string;
    studentId?: string;
    dateRange?: { gte: string; lte: string };
  }): Promise<Attendance[]>;
  findByStudentId(tenantId: string, studentId: string): Promise<(Attendance & { id: string })[]>;
  findByStudentIds(tenantId: string, studentIds: string[], limit?: number): Promise<(Attendance & { id: string })[]>;
  create(data: Omit<Attendance, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  bulkCreate(data: Omit<Attendance, "createdAt" | "updatedAt">[], tenantId: string): Promise<string[]>;
  update(id: string, data: Partial<Attendance>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  getDb(): Firestore;
  getCollectionName(): string;
}
