export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logAction } from "@/lib/audit";
import type { TenantContext } from "@/types/api";
import * as XLSX from 'xlsx';

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        try {
          // 1. Get file from FormData
          const formData = await req.formData();
          const file = formData.get("file") as File;

          if (!file) {
            return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
          }

          // 2. Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // 3. Parse Excel with xlsx (server-side only)
          const workbook = XLSX.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const studentsToAdd: any[] = [];
          const errors: string[] = [];

          // 4. Parse rows
          jsonData.forEach((row: any, index: number) => {
            const name = row['Name'] || row['Full Name'] || row['fullName'];
            const fatherName = row['Father Name'] || row['fatherName'];
            const classGrade = row['Class'] || row['classGrade'];
            const section = row['Section'] || row['section'];
            const rollNumber = row['Roll No'] || row['rollNumber'];

            if (!name || !classGrade) {
              errors.push(`Row ${index + 2}: Name and Class are required`);
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

          if (studentsToAdd.length === 0) {
            return NextResponse.json({ success: false, message: "No valid student records found" }, { status: 400 });
          }

          // 5. Batch write to Firestore
          const batch = adminDb.batch();
          let count = 0;

          for (const student of studentsToAdd) {
            const docRef = adminDb.collection("students").doc();
            batch.set(docRef, student);
            count++;
          }

          await batch.commit();

          // 6. Audit log
          await logAction({
            action: "students.bulk_create",
            userId: user.uid,
            tenantId,
            entityType: "student",
            metadata: { count, fileName: file.name },
          });

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
