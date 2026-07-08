export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StaffService } from "@/services/StaffService";
import { AppError } from "@/errors/AppError";
import type { TenantContext } from "@/types/api";
import * as XLSX from "xlsx";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.update)(
        async (req: Request, { tenantId, user }: TenantContext) => {
          const formData = await req.formData();
          const file = formData.get("file") as File;

          if (!file) {
            return createApiResponse(400, null, "No file provided");
          }

          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(new Uint8Array(arrayBuffer));

          const workbook = XLSX.read(buffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const service = new StaffService();
          const results: any[] = [];
          const errors: string[] = [];

          for (const row of jsonData as any[]) {
            const fullName = row["Full Name"] || row["fullName"] || row["Name"];
            const email = row["Email"] || row["email"];

            if (!fullName || String(fullName).trim().length < 2) {
              errors.push(`Invalid row: Full Name is required`);
              continue;
            }

            try {
              const id = await service.create(
                {
                  personal: {
                    fullName: String(fullName).trim(),
                    email: email || "",
                  },
                  professional: {
                    designation: row["Designation"] || row["designation"] || "Teacher",
                    personnelNo: row["Personnel No"] || row["personnelNo"] || "",
                  },
                  admissionMethod: "bulk",
                },
                tenantId,
                user.uid
              );
              results.push({ success: true, id, fullName });
            } catch (err: any) {
              errors.push(err.message);
              results.push({ success: false, fullName, error: err.message });
            }
          }

          // Audit log
          const auditRef = adminDb.collection("logs").doc();
          await auditRef.set({
            action: "staff.bulk_import",
            userId: user.uid,
            tenantId,
            entityType: "staff",
            metadata: { total: jsonData.length, success: results.filter((r) => r.success).length, errors: errors.length },
            createdAt: FieldValue.serverTimestamp(),
          });

          return createApiResponse(201, {
            imported: results.filter((r) => r.success).length,
            failed: errors.length,
            results,
            errors,
          });
        }
      )
    )
  )
);

