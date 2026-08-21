// services/fee-reminder.service.ts
import { FeesRepository } from "@/repositories/fees.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { TenantRepository } from "@/repositories/tenant.repository";
import { sendEmail } from "@/lib/email";

export class FeeReminderService {
  private feesRepo = new FeesRepository();
  private studentRepo = new StudentRepository();
  private tenantRepo = new TenantRepository();

  async sendReminders(): Promise<{ processed: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const tenants = await this.tenantRepo.listAll();
    let processed = 0;

    for (const tenant of tenants) {
      const tenantId = tenant.id!;
      const overdueFees = await this.feesRepo.findWithFilters(tenantId, { paid: false, dueBefore: today });

      for (const fee of overdueFees) {
        const feeData = fee as any;
        if (!feeData.studentId) continue;

        const student = feeData.email ? null : await this.studentRepo.findById(feeData.studentId, tenantId);
        const studentData = student as any;
        const recipient = feeData.email || studentData?.parentEmail;

        if (recipient) {
          await sendEmail(
            recipient,
            "Fee Due Reminder",
            `<p>Dear Parent,</p>
             <p>This is a reminder that <strong>Rs. ${feeData.amountPaid}</strong> for <strong>${feeData.feeMonth}</strong> was due on <strong>${feeData.dueDate}</strong>.</p>
             <p>Please log in to the portal to make the payment.</p>
             <a href="${process.env.NEXT_PUBLIC_BASE_URL}/parent/dashboard">Pay Now</a>`
          );
          processed++;
        }
      }
    }

    return { processed };
  }
}
