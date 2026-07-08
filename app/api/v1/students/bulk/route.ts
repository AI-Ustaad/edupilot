export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import type { TenantContext } from "@/types/api";
import * as XLSX from 'xlsx';

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
          return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
        }

        // Parse Excel
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map rows to student data
        const studentsToAdd: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const fullName = row['Name'] || row['Full Name'] || row['fullName'];
          const fatherName = row['Father Name'] || row['fatherName'];
          const classGrade = row['Class'] || row['classGrade'];
          const section = row['Section'] || row['section'];
          const rollNumber = row['Roll No'] || row['rollNumber'];

          if (!fullName || !classGrade) {
            errors.push(`Row ${index + 2}: Name and Class are required`);
            return;
          }

          studentsToAdd.push({
            fullName,
            fatherName: fatherName || "N/A",
            classGrade,
            section: section || "A",
            rollNumber: rollNumber || undefined,
          });
        });

        if (errors.length > 0) {
          return NextResponse.json({ success: false, message: "Validation errors", errors }, { status: 400 });
        }

        if (studentsToAdd.length === 0) {
          return NextResponse.json({ success: false, message: "No valid student records found" }, { status: 400 });
        }

        // Delegate to service
        const service = new StudentService();
        const result = await service.bulkCreate(studentsToAdd, tenantId, user.uid);

        return NextResponse.json({
          success: true,
          message: `Successfully imported ${result.count} students`,
          count: result.count,
        });
      })
    )
  )
);

