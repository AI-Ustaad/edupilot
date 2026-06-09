// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logAction } from "@/lib/audit";
import type { TenantContext } from "@/types/api";
import ExcelJS from "exceljs"; // ✅ NEW: Secure Excel Parser

export const runtime = 'nodejs';

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        try {
          // 1. Get the file buffer from the request
          const formData = await req.formData();
          const file = formData.get("file") as File;

          if (!file) {
            return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
          }

          // 2. Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // 3. ✅ SECURE: Parse with ExcelJS instead of xlsx
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          
          const worksheet = workbook.getWorksheet(1); // Get first sheet
          if (!worksheet) {
            return NextResponse.json({ success: false, message: "Invalid Excel file: No worksheet found" }, { status: 400 });
          }

          const studentsToAdd: any[] = [];
          const errors: string[] = [];

          // 4. Iterate through rows (Skip row 1 if it's headers)
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row

            const name = row.getCell(1).value?.toString().trim();
            const fatherName = row.getCell(2).value?.toString().trim();
            const classGrade = row.getCell(3).value?.toString().trim();
            const section = row.getCell(4).value?.toString().trim();
            const rollNumber = row.getCell(5).value?.toString().trim();

            if (!name || !classGrade) {
              errors.push(`Row ${rowNumber}: Name and Class are required`);
              return;
            }

            studentsToAdd.push({
              fullName: name,
              fatherName: fatherName || "N/A",
              classGrade,
              section: section || "A",
              rollNumber: rollNumber || "0",
              tenantId,
              createdAt: FieldValue.serverTimestamp(),
              createdBy: user.uid,
              deleted: false,
            });
          });

          if (errors.length > 0) {
            return NextResponse.json({ success: false, message: "Validation errors", errors }, { status: 400 });
          }

          // 5. Batch Write to Firestore (Max 500 per batch)
          const batch = adminDb.batch();
          let count = 0;

          for (const student of studentsToAdd) {
            const docRef = adminDb.collection("students").doc();
            batch.set(docRef, student);
            count++;
            
            // 🛡️ Audit Log for bulk creation
            await logAction({
              action: "students.bulk_create",
              userId: user.uid,
              tenantId,
              entityType: "student",
              metadata: { count: studentsToAdd.length, fileName: file.name },
            });
          }

          await batch.commit();

          return NextResponse.json({ 
            success: true, 
            message: `Successfully imported ${count} students`,
            count 
          });

        } catch (error: any) {
          console.error("Bulk Upload Error:", error);
          return NextResponse.json({ 
            success: false, 
            message: "Failed to process Excel file. Ensure it is a valid .xlsx format." 
          }, { status: 500 });
        }
      })
    )
  )
);
