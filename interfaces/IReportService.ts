// interfaces/IReportService.ts
export interface IReportService {
  generateAttendanceReport(tenantId: string, month: string): Promise<Buffer>;
  generateAttendanceCSV(tenantId: string, month: string): Promise<string>;
  generateReportCard(tenantId: string, studentId: string, term: string): Promise<Buffer>;
}
