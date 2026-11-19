export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { SubscriptionService } from "@/services/subscription.service";
import type { TenantContext } from "@/types/api";
import * as XLSX from 'xlsx';

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
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
          return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const studentsToAdd: any[] = [];
        const errors: string[] = [];

        (jsonData as any[]).forEach((row: any, index: number) => {
          const fullName = getRowValue(row, ["Full Name", "fullName", "Name", "Student Name", "Student"]);
          const fatherName = getRowValue(row, ["Father Name", "fatherName", "Father"]);
          const guardianName = getRowValue(row, ["Guardian Name", "guardianName", "Guardian"]) || fatherName;
          const classGrade = getRowValue(row, ["Class", "classGrade", "Grade", "Class / Grade", "class"]);
          const section = getRowValue(row, ["Section", "section", "Sec"]);
          const rollNumber = getRowValue(row, ["Roll No", "rollNumber", "Roll Number", "RollNo", "Roll"]);
          const gender = getRowValue(row, ["Gender", "gender", "Sex"]);
          const dob = getRowValue(row, ["DOB", "dob", "Date of Birth", "Birth Date"]);
          const guardianRelation = getRowValue(row, ["Guardian Relation", "guardianRelation", "Relation"]);
          const guardianPhone = getRowValue(row, ["Guardian Phone", "guardianPhone", "Phone", "Mobile", "Contact"]);
          const monthlyFee = getRowValue(row, ["Monthly Fee", "monthlyFee", "Fee", "Tuition Fee"]);

          if (!fullName || fullName.length < 2) {
            errors.push(`Row ${index + 2}: Full Name is required`);
            return;
          }

          if (!classGrade) {
            errors.push(`Row ${index + 2} ("${fullName}"): Class is required`);
            return;
          }

          studentsToAdd.push({
            fullName,
            fatherName: fatherName || guardianName || "N/A",
            guardianName: guardianName || fatherName || "N/A",
            classGrade,
            section: section || "A",
            rollNumber: rollNumber || undefined,
            gender: (gender === "Female" || gender === "Other") ? gender : "Male",
            dob: dob || undefined,
            guardianRelation: guardianRelation || "Guardian",
            guardianPhone: guardianPhone || undefined,
            monthlyFee: monthlyFee ? Number(monthlyFee) : 5000,
          });
        });

        if (studentsToAdd.length === 0) {
          return NextResponse.json({
            success: false,
            message: errors.length > 0 ? "Validation errors in rows" : "No valid student records found",
            errors,
          }, { status: 400 });
        }

        const service = new StudentService();
        const limits = await subscriptionService.getPlanLimits(tenantId);
        await service.checkSubscriptionLimit(tenantId, limits.maxStudents, studentsToAdd.length);

        const result = await service.bulkCreate(tenantId, studentsToAdd, user.uid);

        return NextResponse.json({
          success: true,
          message: `Successfully imported ${result.created} students`,
          count: result.created,
          imported: result.created,
          failed: result.failed,
          results: result.results,
          errors,
        });
      })
    )
  )
);
