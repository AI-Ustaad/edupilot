export const dynamic = 'force-dynamic';
import { FeesRepository } from "@/repositories/fees.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { TenantRepository } from "@/repositories/tenant.repository";
import { sendEmail } from "@/lib/email";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export async function GET(req: Request) {
  // Basic security – verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return createErrorResponse(401, "Unauthorized");
  }

  const today = new Date().toISOString().slice(0, 10);
  const feesRepo = new FeesRepository();
  const studentRepo = new StudentRepository();
  const tenantRepo = new TenantRepository();

  const tenants = await tenantRepo.listAll();
  let processed = 0;

  for (const tenant of tenants) {
    const tenantId = tenant.id!;
    const overdueFees = await feesRepo.findWithFilters(tenantId, { paid: false, dueBefore: today });

    for (const fee of overdueFees) {
      const feeData = fee as any;
      if (!feeData.studentId) continue;

      const student = await studentRepo.findById(feeData.studentId, tenantId);
      const studentData = student as any;

      if (studentData?.parentEmail) {
        await sendEmail(
          studentData.parentEmail,
          "Fee Due Reminder",
          `<p>Dear Parent,</p>
           <p>This is a reminder that <strong>Rs. ${feeData.amount}</strong> for <strong>${feeData.feeMonth}</strong> was due on <strong>${feeData.dueDate}</strong>.</p>
           <p>Please log in to the portal to make the payment.</p>
           <a href="${process.env.NEXT_PUBLIC_BASE_URL}/parent/dashboard">Pay Now</a>`
        );
        processed++;
      }
    }
  }

  return createSuccessResponse({ processed });
}
