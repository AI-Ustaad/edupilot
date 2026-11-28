// interfaces/IAITimetableService.ts
export interface IAITimetableService {
  generateTimetable(req: { classes: string[]; days: string[]; periods: number; subjects: string[]; teachers: string[]; teacherSubjects?: Record<string, string[]> }, tenantId?: string, userId?: string): Promise<any[]>;
}
