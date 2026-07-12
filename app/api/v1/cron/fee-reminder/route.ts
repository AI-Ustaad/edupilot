export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { StudentRepository } from "@/repositories/student.repository";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  // Basic security – verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const overdueFees = await adminDb.collection("fees")
    .where("dueDate", "<", today)
    .where("paid", "==", false)
    .get();

  let processed = 0;
  const studentRepo = new StudentRepository();

  for (const doc of overdueFees.docs) {
    const fee = doc.data();
    const feeTenantId = fee.tenantId;
    if (!feeTenantId || !fee.studentId) continue;

    const student = await studentRepo.findById(fee.studentId, feeTenantId);
    const studentData = student as any;

    if (studentData?.parentEmail) {
      await sendEmail(
        studentData.parentEmail,
        "Fee Due Reminder",
        `<p>Dear Parent,</p>
         <p>This is a reminder that <strong>Rs. ${fee.amount}</strong> for <strong>${fee.feeMonth}</strong> was due on <strong>${fee.dueDate}</strong>.</p>
         <p>Please log in to the portal to make the payment.</p>
         <a href="${process.env.NEXT_PUBLIC_BASE_URL}/parent/dashboard">Pay Now</a>`
      );
      processed++;
    }
  }

  return NextResponse.json({ success: true, processed });
}
