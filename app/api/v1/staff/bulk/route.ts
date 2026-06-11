// Force server-side rendering
import 'server-only';

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

// ✅ Use require for server-only packages
const ExcelJS = require('exceljs');

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        try {
          // 1. Get file from FormData
          const formData = await req.formData();
          const file = formData.get('file') as File;

          if (!file) {
            return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
          }

          // 2. Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // 3. Parse Excel file
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);

          const worksheet = workbook.getWorksheet(1);
          if (!worksheet) {
            return NextResponse.json({ success: false, message: "Invalid Excel file: No worksheet found" }, { status: 400 });
          }

          const staffMembers: any[] = [];
          const errors: string[] = [];

          // 4. Parse rows (skip header)
          worksheet.eachRow((row: any, rowNumber: number) => {
            if (rowNumber === 1) return; // Skip header row

            const fullName = row.getCell(1).value?.toString().trim();
            const email = row.getCell(2).value?.toString().trim();
            const phone = row.getCell(3).value?.toString().trim();
            const designation = row.getCell(4).value?.toString().trim();
            const personnelNo = row.getCell(5).value?.toString().trim();

            if (!fullName) {
              errors.push(`Row ${rowNumber}: Full Name is required`);
              return;
            }

            staffMembers.push({
              personal: { 
                fullName, 
                email: email || "", 
                phone: phone || "" 
              },
              professional: { 
                designation: designation || "Teacher", 
                personnelNo: personnelNo || "" 
              },
              tenantId,
              createdAt: FieldValue.serverTimestamp(),
              createdBy: user.uid,
              deleted: false,
            });
          });

          if (errors.length > 0) {
            return NextResponse.json({ success: false, message: "Validation errors", errors }, { status: 400 });
          }

          if (staffMembers.length === 0) {
            return NextResponse.json({ success: false, message: "No valid staff records found" }, { status: 400 });
          }

          // 5. Batch write to Firestore
          const batch = adminDb.batch();
          let count = 0;

          for (const staff of staffMembers) {
            const docRef = adminDb.collection("staff").doc();
            batch.set(docRef, staff);
            count++;
          }

          await batch.commit();

          // 6. Audit log
          await logAction({
            action: "staff.bulk_create",
            userId: user.uid,
            tenantId,
            entityType: "staff",
            metadata: { count, fileName: file.name },
          });

          return NextResponse.json({ 
            success: true, 
            count, 
            message: `Successfully imported ${count} staff members` 
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
