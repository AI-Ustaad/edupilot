import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("fees")
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .get();

      const rows = snapshot.docs.map(doc => doc.data());
      
      // CSV header
      const headers = ["Student Name", "Roll No", "Class", "Month", "Amount Paid", "Payment Method", "Date"];
      const csvContent = [
        headers.join(","),
        ...rows.map(r => [
          `"${r.studentName || ""}"`,
          `"${r.rollNumber || ""}"`,
          `"${r.classGrade || ""}"`,
          `"${r.feeMonth || ""}"`,
          r.amountPaid || 0,
          `"${r.paymentMethod || ""}"`,
          r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString() : "",
        ].join(","))
      ].join("\n");

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="fees_${tenantId}.csv"`,
        },
      });
    })
  )
);
