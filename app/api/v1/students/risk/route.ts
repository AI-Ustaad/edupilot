export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      async (req: Request, { tenantId }: TenantContext) => {
        try {
          // صرف اس tenant کے سٹوڈنٹس لائیں (Limit 50 for performance)
          const studentsSnap = await adminDb.collection("students").where("tenantId", "==", tenantId).limit(50).get();
          const riskStudents: any[] = [];

          for (const doc of studentsSnap.docs) {
            const student = { id: doc.id, ...doc.data() };
            
            // ہر سٹوڈنٹ کے لیے صرف ایک Simple Query (No Index Required)
            const attSnap = await adminDb.collection("attendance").where("studentId", "==", student.id).limit(30).get();

            let present = 0, total = 0;
            attSnap.forEach(d => {
              // Tenant Check in memory
              if (d.data().tenantId === tenantId) {
                total++;
                if (d.data().status === "Present") present++;
              }
            });
            
            const attendancePct = total > 0 ? (present / total) * 100 : 100;

            // اگر حاضری 60% سے کم ہے تو Risk میں شامل کر دیں
            if (attendancePct < 60) {
              riskStudents.push({
                ...student,
                attendance: Math.round(attendancePct),
                marks: 0, // Marks Query کو ہٹا دیا ہے تاکہ Function Timeout نہ ہو
                riskReason: "Low Attendance",
              });
            }
          }

          return createSuccessResponse(riskStudents);
          
        } catch (error: any) {
          logger.error("Risk API Error:", { metadata: { error } });
          // اگر کوئی بھی Error آئے تو خالی Array Return کر دیں تاکہ Dashboard Crash نہ ہو
          return createApiResponse(200, []); 
        }
      }
    )
  )
);
