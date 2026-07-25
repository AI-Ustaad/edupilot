// interfaces/IAttendanceService.ts
import type { AttendanceEntity } from "@/entities/attendance.entity";
import type { CreateAttendanceDTO, UpdateAttendanceDTO } from "@/dto";
import type { PaginatedResult } from "@/types/api";

export interface IAttendanceService {
  createSingle(data: CreateAttendanceDTO, tenantId: string, userId: string): Promise<AttendanceEntity>;
  createBulk(data: CreateAttendanceDTO[], tenantId: string, userId: string): Promise<{ success: boolean; message: string }>;
  listAttendance(tenantId: string, filters?: { date?: string; classGrade?: string; section?: string; studentId?: string }): Promise<AttendanceEntity[]>;
  findByStudentId(tenantId: string, studentId: string): Promise<AttendanceEntity[]>;
  getById(tenantId: string, id: string): Promise<AttendanceEntity | null>;
  updateAttendance(tenantId: string, id: string, data: UpdateAttendanceDTO, userId?: string): Promise<AttendanceEntity>;
  deleteAttendance(tenantId: string, id: string, userId?: string): Promise<void>;
  getTodayAttendance(tenantId: string): Promise<{ present: number; absent: number; late: number; total: number }>;
  getWeeklyAttendanceTrend(tenantId: string): Promise<{ day: string; percent: number }[]>;
}
