import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("attendance")
        .where("tenantId", "==", tenantId)
        .orderBy("date", "desc")
        .get();

      const rows = snapshot.docs.map(doc => doc.data());

      const headers = ["Student Name", "Roll No", "Class", "Section", "Date", "Status"];
      const csvContent = [
        headers.join(","),
        ...rows.map(r => [
          `"${r.studentName || ""}"`,
          `"${r.rollNumber || ""}"`,
          `"${r.classGrade || ""}"`,
          `"${r.section || ""}"`,
          `"${r.date || ""}"`,
          `"${r.status || ""}"`,
        ].join(","))
      ].join("\n");

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="attendance_${tenantId}.csv"`,
        },
      });
    })
  )
);
