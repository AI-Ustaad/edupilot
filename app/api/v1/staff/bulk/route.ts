export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createErrorResponse, createApiResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import { SubscriptionService } from "@/services/subscription.service";
import { resolveStaffCategory } from "@/lib/mappers/StaffPersistenceMapper";
import type { CreateStaffDTO } from "@/dto";
import type { TenantContext } from "@/types/api";
import * as XLSX from "xlsx";

const subscriptionService = new SubscriptionService();

function getRowValue(row: Record<string, any>, aliases: string[]): string {
  const normalizedRowKeys = Object.keys(row).map(k => ({
    raw: k,
    clean: k.toLowerCase().replace(/[^a-z0-9]/g, "")
  }));

  for (const alias of aliases) {
    const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = normalizedRowKeys.find(k => k.clean === cleanAlias);
    if (match && row[match.raw] !== undefined && row[match.raw] !== null) {
      const val = String(row[match.raw]).trim();
      if (val) return val;
    }
  }
  return "";
}

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

          (jsonData as any[]).forEach((row: any, index: number) => {
            const fullName = getRowValue(row, ["Full Name", "fullName", "Name", "Staff Name", "Employee Name"]);
            const personnelNo = getRowValue(row, ["Employee ID", "EmployeeId", "Personnel No", "personnelNo", "PersonnelNo", "Staff ID", "ID", "empId"]);
            const designation = getRowValue(row, ["Designation", "Role", "Job Title", "designation", "role"]) || "Teacher";
            const department = getRowValue(row, ["Department", "Dept", "department", "dept"]) || "General";
            const rawCategory = getRowValue(row, ["Category", "Staff Category", "category"]);
            const category = resolveStaffCategory(designation, department, rawCategory);
            const email = getRowValue(row, ["Email", "Email Address", "email"]);
            const mobile = getRowValue(row, ["Mobile", "Phone", "Phone Number", "Contact", "Cell", "mobile", "phone"]);
            const cnic = getRowValue(row, ["CNIC", "ID Card", "National ID", "cnic"]);
            const gender = getRowValue(row, ["Gender", "Sex", "gender"]);
            const salary = getRowValue(row, ["Basic Salary", "Salary", "Monthly Salary", "Pay", "basicSalary", "salary"]);
            const qualification = getRowValue(row, ["Qualification", "Degree", "qualification"]);
            const joiningDate = getRowValue(row, ["Joining Date", "JoiningDate", "Date of Joining", "joiningDate"]);

            if (!fullName || fullName.length < 2) {
              errors.push(`Row ${index + 2}: Full Name is required`);
              return;
            }

            const staffDTO: any = {
              personal: {
                fullName,
                cnic: cnic || undefined,
                gender: (gender === "Female" || gender === "Other") ? gender : (gender === "Male" ? "Male" : undefined),
              },
              contact: {
                email: email || "",
                mobile: mobile || "",
              },
              professional: {
                designation,
                personnelNo: personnelNo || undefined,
                employeeId: personnelNo || undefined,
                department,
                category,
                employmentType: "Full-time",
                qualification: qualification || undefined,
                joiningDate: joiningDate || undefined,
              },
            };

            const numSalary = Number(salary);
            if (!isNaN(numSalary) && numSalary >= 0) {
              staffDTO.payroll = {
                basicSalary: numSalary,
                grossSalary: numSalary,
                netSalary: numSalary,
              };
            }

            staffToCreate.push(staffDTO as CreateStaffDTO);
          });

          if (staffToCreate.length === 0) {
            return createErrorResponse(400, errors.length > 0 ? errors.join("; ") : "No valid staff records found");
          }

          const limits = await subscriptionService.getPlanLimits(tenantId);
          await service.checkSubscriptionLimit(tenantId, limits.maxStaff, staffToCreate.length);

          const result = await service.bulkCreate(tenantId, staffToCreate, user.uid);

          return createApiResponse(201, {
            success: true,
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
