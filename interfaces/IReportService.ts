// interfaces/IReportService.ts
export interface IReportService {
  generateAttendanceReport(tenantId: string, month: string): Promise<Buffer>;
  generateAttendanceCSV(tenantId: string, month: string): Promise<string>;
}
