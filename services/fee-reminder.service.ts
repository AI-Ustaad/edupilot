// services/fee-reminder.service.ts
import { FeesRepository } from "@/repositories/fees.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { TenantRepository } from "@/repositories/tenant.repository";
import { sendEmail } from "@/lib/email";

export class FeeReminderService {
  private feesRepo: FeesRepository;
  private studentRepo: StudentRepository;
  private tenantRepo: TenantRepository;

  constructor(
    feesRepo?: FeesRepository,
    studentRepo?: StudentRepository,
    tenantRepo?: TenantRepository
  ) {
    this.feesRepo = feesRepo ?? new FeesRepository();
    this.studentRepo = studentRepo ?? new StudentRepository();
    this.tenantRepo = tenantRepo ?? new TenantRepository();
  }

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

        // Calculate true outstanding balance reliably (DEF-012)
        const totalAmount = Number(feeData.totalAmount ?? feeData.amount ?? feeData.amountDue ?? feeData.amountPaid ?? 0);
        const paidAmount = (feeData.status === "unpaid" || feeData.status === "pending" || feeData.status === "overdue")
          ? Number(feeData.paidAmount ?? 0)
          : Number(feeData.amountPaid ?? 0);
        const discount = Number(feeData.discount ?? 0);
        const dueAmount = Math.max(0, totalAmount - paidAmount - discount) || Number(feeData.amount ?? feeData.amountPaid ?? 0);

        if (dueAmount <= 0) continue;

        const student = feeData.email ? null : await this.studentRepo.findById(feeData.studentId, tenantId);
        const studentData = student as any;
        const recipient = feeData.email || studentData?.parentEmail || studentData?.guardianEmail || studentData?.email;

        if (recipient) {
          const feeMonth = feeData.feeMonth || "the current billing period";
          const dueDate = feeData.dueDate || "the due date";
          await sendEmail(
            recipient,
            "Fee Due Reminder",
            `<p>Dear Parent,</p>
             <p>This is a reminder that <strong>Rs. ${dueAmount}</strong> for <strong>${feeMonth}</strong> was due on <strong>${dueDate}</strong>.</p>
             <p>Please log in to the portal to make the payment.</p>
             <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/parent/dashboard">Pay Now</a>`
          );
          processed++;
        }
      }
    }

    return { processed };
  }
}
