export interface IBackgroundJobService {
  generateAttendanceReport(tenantId: string, startDate: string, endDate: string): Promise<any>;
  processFeeReminders(tenantId: string): Promise<{ processed: number }>;
  processEvent(event: { type: string; data: any }): Promise<any>;
  getJobStatus(jobId: string): Promise<any>;
}
