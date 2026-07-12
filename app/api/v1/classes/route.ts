import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { AuditService } from "@/services/AuditService";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

// ==========================================
// 1. GET: Fetch Sections Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const snap = await adminDb.collection("sections")
          .where("tenantId", "==", tenantId)
          .get();
        
        // ✅ ULTIMATE FIX: Cast d.data() to 'any' to bypass strict type inference
        const sections = snap.docs.map(d => ({ 
          id: d.id, 
          ...(d.data() as any) 
        })).filter((s: any) => !s.deleted);

        return createSuccessResponse(sections);
      })
    )
  )
);

// ==========================================
// 2. POST: Create New Section
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const data = await req.json();
        const { classGrade, sectionName, subjects } = data;

        if (!classGrade || !sectionName) {
          return createErrorResponse(400, "Class and Section name required");
        }

        const docRef = adminDb.collection("sections").doc();
        await docRef.set({
          classGrade,
          sectionName,
          subjects: subjects || { core: [], electives: [] },
          tenantId,
          deleted: false,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: user.uid,
        });

        const audit = new AuditService();
        await audit.log({
          action: "class.create",
          userId: user.uid,
          tenantId,
          entityId: docRef.id,
          entityType: "section",
          metadata: { classGrade, sectionName },
        });

        return createApiResponse(201, { id: docRef.id }, "Section created successfully");
      })
    )
  )
);

// ==========================================
// 3. DELETE: Soft Delete Section
// ==========================================
export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const sectionId = searchParams.get("id");

        if (!sectionId) {
          return createErrorResponse(400, "Section ID required");
        }

        const docRef = adminDb.collection("sections").doc(sectionId);
        const snap = await docRef.get();

        // 🛡️ Verify ownership
        if (!snap.exists || (snap.data() as any)?.tenantId !== tenantId) {
          return createErrorResponse(404, "Section not found");
        }

        // 🛑 SOFT DELETE
        await docRef.update({
          deleted: true,
          deletedAt: FieldValue.serverTimestamp(),
          deletedBy: user.uid,
        });

        const audit = new AuditService();
        await audit.log({
          action: "class.delete",
          userId: user.uid,
          tenantId,
          entityId: sectionId,
          entityType: "section",
        });

        return createSuccessResponse(null, { message: "Section archived" });
      })
    )
  )
);
