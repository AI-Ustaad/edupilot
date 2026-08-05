import { AttendanceService } from "@/services/attendance.service";
import { FeesRepository } from "@/repositories/fees.repository";
import { TenantRepository } from "@/repositories/tenant.repository";
import { EventOutboxRepository } from "@/repositories/event-outbox.repository";
import { EventWorker } from "@/lib/workers/event.worker";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger/logger";
import type { IBackgroundJobService } from "@/interfaces/IBackgroundJobService";

export class BackgroundJobService implements IBackgroundJobService {
  private attendanceService: AttendanceService;
  private feesRepo: FeesRepository;
  private tenantRepo: TenantRepository;
  private eventOutboxRepo: EventOutboxRepository;

  constructor(
    attendanceService?: AttendanceService,
    feesRepo?: FeesRepository,
    tenantRepo?: TenantRepository,
    eventOutboxRepo?: EventOutboxRepository
  ) {
    this.attendanceService = attendanceService ?? new AttendanceService();
    this.feesRepo = feesRepo ?? new FeesRepository();
    this.tenantRepo = tenantRepo ?? new TenantRepository();
    this.eventOutboxRepo = eventOutboxRepo ?? new EventOutboxRepository();
  }

  async generateAttendanceReport(tenantId: string, startDate: string, endDate: string): Promise<any> {
    const records = await this.attendanceService.listAttendance(tenantId);
    const lastMonth = new Date(startDate).toISOString().slice(0, 7);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@school.com";
    await sendEmail(
      adminEmail,
      `Monthly Attendance Report - ${lastMonth}`,
      `<p>Attendance report for ${lastMonth} has been generated. Total records: ${records.length}</p>`
    );

    return { records, month: lastMonth };
  }

  async processFeeReminders(tenantId: string): Promise<{ processed: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const overdueFees = await this.feesRepo.findWithFilters(tenantId, { paid: false, dueBefore: today });
    let processed = 0;

    for (const fee of overdueFees) {
      const feeData = fee as any;
      if (feeData.email) {
        await sendEmail(
          feeData.email,
          `Fee Reminder: ${feeData.feeMonth}`,
          `<p>Dear Parent,<br/>This is a reminder that the fee of Rs. ${feeData.amountPaid} for ${feeData.feeMonth} is pending.<br/>Please make the payment at your earliest convenience.</p>`
        );
        processed++;
      }
    }

    return { processed };
  }

  async processEvent(event: { type: string; data: any }): Promise<any> {
    const worker = new EventWorker(this.eventOutboxRepo);
    return worker.processBatch(event.data?.limit ?? 50);
  }

  async getJobStatus(jobId: string): Promise<any> {
    return { jobId, status: "unknown" };
  }
}

export const backgroundJobService = new BackgroundJobService();
