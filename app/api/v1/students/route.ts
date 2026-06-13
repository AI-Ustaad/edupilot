// app/api/v1/students/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logAction } from "@/lib/audit";
import { standardRateLimit } from "@/lib/ratelimit";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

// ==========================================
// GET: Fetch Students (with filters)
// ==========================================
export const GET = withErrorHandler(
  standardRateLimit(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
          const { searchParams } = new URL(req.url);
          const classGrade = searchParams.get("classGrade");
          const section = searchParams.get("section");
          const search = searchParams.get("search");
          const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

          let query: any = adminDb.collection("students")
            .where("tenantId", "==", tenantId)
            .where("deleted", "==", false);

          if (classGrade) query = query.where("classGrade", "==", classGrade);
          if (section) query = query.where("section", "==", section);

          query = query.limit(limit);

          const snap = await query.get();
          
          let students = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
          }));

          // Client-side search (Firestore doesn't support text search)
          if (search) {
            const searchLower = search.toLowerCase();
            students = students.filter((s: any) => 
              s.fullName?.toLowerCase().includes(searchLower) ||
              s.rollNumber?.toString().includes(search) ||
              s.fatherName?.toLowerCase().includes(searchLower)
            );
          }

          return NextResponse.json({
            success: true,
            data: students,
            count: students.length,
          });
        })
      )
    )
  )
);

// ==========================================
// POST: Create New Student
// ==========================================
export const POST = withErrorHandler(
  standardRateLimit(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.students.create)(async (req: Request, { tenantId, user }: TenantContext) => {
          const data = await req.json();

          // Validation
          if (!data.fullName || !data.classGrade) {
            return NextResponse.json(
              { success: false, error: "Full name and class are required" },
              { status: 400 }
            );
          }

          // Create student document
          const docRef = adminDb.collection("students").doc();
          
          const studentData = {
            tenantId,
            fullName: data.fullName,
            fatherName: data.fatherName || "",
            classGrade: data.classGrade,
            section: data.section || "A",
            rollNumber: data.rollNumber || "0",
            dateOfBirth: data.dateOfBirth || null,
            gender: data.gender || "Male",
            contact: data.contact || {},
            address: data.address || {},
            parentId: data.parentId || null,
            admissionDate: data.admissionDate || FieldValue.serverTimestamp(),
            status: data.status || "active",
            deleted: false,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: user.uid,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: user.uid,
          };

          await docRef.set(studentData);

          // Audit log
          await logAction({
            action: "students.create",
            userId: user.uid,
            tenantId,
            entityId: docRef.id,
            entityType: "student",
            metadata: {
              fullName: data.fullName,
              classGrade: data.classGrade,
              section: data.section,
            },
          });

          return NextResponse.json({
            success: true,
            id: docRef.id,
            message: "Student created successfully",
          }, { status: 201 });
        })
      )
    )
  )
);

// ==========================================
// PUT: Update Student
// ==========================================
export const PUT = withErrorHandler(
  standardRateLimit(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
          const data = await req.json();
          const studentId = data.id;

          if (!studentId) {
            return NextResponse.json(
              { success: false, error: "Student ID required" },
              { status: 400 }
            );
          }

          // Verify ownership
          const docRef = adminDb.collection("students").doc(studentId);
          const snap = await docRef.get();

          if (!snap.exists || snap.data()?.tenantId !== tenantId) {
            return NextResponse.json(
              { success: false, error: "Student not found" },
              { status: 404 }
            );
          }

          // Update
          const { id, ...updateData } = data;
          await docRef.update({
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: user.uid,
          });

          // Audit log
          await logAction({
            action: "students.update",
            userId: user.uid,
            tenantId,
            entityId: studentId,
            entityType: "student",
            metadata: { updatedFields: Object.keys(updateData) },
          });

          return NextResponse.json({
            success: true,
            message: "Student updated successfully",
          });
        })
      )
    )
  )
);

// ==========================================
// DELETE: Soft Delete Student
// ==========================================
export const DELETE = withErrorHandler(
  standardRateLimit(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.students.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
          const { searchParams } = new URL(req.url);
          const studentId = searchParams.get("id");

          if (!studentId) {
            return NextResponse.json(
              { success: false, error: "Student ID required" },
              { status: 400 }
            );
          }

          // Verify ownership
          const docRef = adminDb.collection("students").doc(studentId);
          const snap = await docRef.get();

          if (!snap.exists || snap.data()?.tenantId !== tenantId) {
            return NextResponse.json(
              { success: false, error: "Student not found" },
              { status: 404 }
            );
          }

          // Soft delete
          await docRef.update({
            deleted: true,
            deletedAt: FieldValue.serverTimestamp(),
            deletedBy: user.uid,
          });

          // Audit log
          await logAction({
            action: "students.delete",
            userId: user.uid,
            tenantId,
            entityId: studentId,
            entityType: "student",
            metadata: {
              fullName: snap.data()?.fullName,
              classGrade: snap.data()?.classGrade,
            },
          });

          return NextResponse.json({
            success: true,
            message: "Student archived successfully",
          });
        })
      )
    )
  )
);
