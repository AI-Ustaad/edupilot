export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import type { CreateStaffDTO } from "@/dto";
import type { TenantContext } from "@/types/api";
import * as XLSX from "xlsx";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.create)(
        async (req: Request, { tenantId, user }: TenantContext) => {
          const formData = await req.formData();
          const file = formData.get("file") as File;

          if (!file) {
            return createErrorResponse(400, "No file provided");
          }

          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(new Uint8Array(arrayBuffer));

          const workbook = XLSX.read(buffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const service = new StaffService();
          const staffToCreate: CreateStaffDTO[] = [];
          const errors: string[] = [];

          for (const row of jsonData as any[]) {
            const fullName = row["Full Name"] || row["fullName"] || row["Name"];
            const personnelNo = row["Personnel No"] || row["personnelNo"] || row["PersonnelNo"];

            if (!fullName || String(fullName).trim().length < 2) {
              errors.push(`Invalid row: Full Name is required`);
              continue;
            }

            if (!personnelNo || String(personnelNo).trim() === "") {
              errors.push(`Skipped row "${fullName}": Personnel No is required`);
              continue;
            }

            staffToCreate.push({
              personal: {
                fullName: String(fullName).trim(),
              },
              contact: {
                email: row["Email"] || row["email"] || "",
                mobile: row["Phone"] || row["phone"] || row["Mobile"] || "",
              },
              professional: {
                designation: row["Designation"] || row["designation"] || "Teacher",
                personnelNo: String(personnelNo).trim(),
                department: row["Department"] || row["department"] || "",
                employmentType: row["Employment Type"] || row["employmentType"] || "",
              },
            } as CreateStaffDTO);
          }

          if (staffToCreate.length === 0) {
            return createErrorResponse(400, "No valid staff records found");
          }

          const result = await service.bulkCreate(tenantId, staffToCreate, user.uid);

          return createApiResponse(201, {
            imported: result.created,
            failed: result.failed,
            results: result.results,
            errors,
          });
        }
      )
    )
  )
);
