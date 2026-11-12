export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createApiResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const url = new URL(req.url);
      const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

      try {
        const snapshot = await adminDb
          .collection("staff_attendance")
          .where("tenantId", "==", tenantId)
          .where("date", "==", date)
          .get();

        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        return createSuccessResponse(records);
      } catch (error: any) {
        logger.error("[StaffAttendanceAPI] Failed to fetch records:", error);
        return createErrorResponse(500, "Failed to fetch staff attendance");
      }
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      try {
        const body = await req.json();
        const records: any[] = Array.isArray(body) ? body : (body.records || []);
        const date = body.date || (records[0]?.date) || new Date().toISOString().split("T")[0];

        if (!Array.isArray(records) || records.length === 0) {
          return createErrorResponse(400, "No staff attendance records provided");
        }

        const batch = adminDb.batch();
        const now = new Date().toISOString();

        for (const item of records) {
          const staffId = item.staffId || item.id;
          if (!staffId) continue;
          const docId = `${staffId}_${date}`;
          const docRef = adminDb.collection("staff_attendance").doc(docId);

          batch.set(
            docRef,
            {
              tenantId,
              staffId,
              staffName: item.staffName || item.name || item.fullName || "Staff",
              date,
              status: (item.status || "present").toLowerCase(),
              remarks: item.remarks || "",
              markedBy: user?.uid || "admin",
              updatedAt: now,
              createdAt: item.createdAt || now,
            },
            { merge: true }
          );
        }

        await batch.commit();

        logger.info("[StaffAttendanceAPI] Successfully saved attendance batch", {
          metadata: { tenantId, date, count: records.length },
        });

        return createApiResponse(201, { count: records.length, date }, "Staff attendance saved successfully");
      } catch (error: any) {
        logger.error("[StaffAttendanceAPI] Failed to save staff attendance:", error);
        return createErrorResponse(500, error.message || "Failed to save staff attendance");
      }
    })
  )
);
