export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import type { TenantContext } from "@/types/api";

export async function runStuckDataCleanup(tenantId: string): Promise<Record<string, number>> {
  const deletedCounts: Record<string, number> = {
    leaves: 0,
    homework: 0,
    lessonPlans: 0,
    assignments: 0,
    quizzes: 0,
    books: 0,
    buses: 0,
    behavior: 0,
    users: 0,
    students: 0,
    staff: 0,
  };

  // 1. Leaves
  for (const coll of ["leaves", "leave_requests"]) {
    const snap = await adminDb.collection(coll).where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
    for (const doc of snap.docs) {
      const d = doc.data() || {};
      if (
        doc.id === "3Rl6b5i6" ||
        String(d.reason || "").includes("TEST — Audit leave") ||
        String(d.notes || "").includes("TEST — Audit leave") ||
        String(d.reason || "").includes("TEST — Leave audit 24 Nov") ||
        String(d.notes || "").includes("TEST — Leave audit 24 Nov")
      ) {
        await adminDb.collection(coll).doc(doc.id).delete().catch(() => {});
        deletedCounts.leaves++;
      }
    }
  }

  // 2. Homework
  const hwSnap = await adminDb.collection("homework").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of hwSnap.docs) {
    const d = doc.data() || {};
    if (
      doc.id === "ubVMtF6s" ||
      doc.id === "faOtOsMq" ||
      String(d.title || "").includes("TEST — Audit Homework 3") ||
      String(d.title || "").includes("TEST — Audit Homework 2") ||
      String(d.title || "").includes("TEST — Homework 2")
    ) {
      await adminDb.collection("homework").doc(doc.id).delete().catch(() => {});
      deletedCounts.homework++;
    }
  }

  // 3. Lesson Plans
  const lpSnap = await adminDb.collection("lesson_plans").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of lpSnap.docs) {
    const d = doc.data() || {};
    if (
      doc.id === "qvdwaxqZ" ||
      String(d.topic || "").trim() === "C1-TEST Fractions" ||
      String(d.topic || "").trim() === "C1-TEST"
    ) {
      await adminDb.collection("lesson_plans").doc(doc.id).delete().catch(() => {});
      deletedCounts.lessonPlans++;
    }
  }

  // 4. Assignments
  const asSnap = await adminDb.collection("assignments").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of asSnap.docs) {
    const d = doc.data() || {};
    if (String(d.title || "").trim() === "TEST — Audit Assignment") {
      await adminDb.collection("assignments").doc(doc.id).delete().catch(() => {});
      deletedCounts.assignments++;
    }
  }

  // 5. Quizzes
  const qzSnap = await adminDb.collection("quizzes").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of qzSnap.docs) {
    const d = doc.data() || {};
    if (String(d.title || "").trim() === "TEST — Audit Quiz") {
      await adminDb.collection("quizzes").doc(doc.id).delete().catch(() => {});
      deletedCounts.quizzes++;
    }
  }

  // 6. Books
  const bkSnap = await adminDb.collection("books").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of bkSnap.docs) {
    const d = doc.data() || {};
    if (String(d.title || "").trim() === "TEST — Audit Book") {
      await adminDb.collection("books").doc(doc.id).delete().catch(() => {});
      deletedCounts.books++;
    }
  }

  // 7. Buses
  const busSnap = await adminDb.collection("buses").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of busSnap.docs) {
    const d = doc.data() || {};
    if (
      doc.id === "bYubkoGC" ||
      doc.id === "AtlwmG7Z" ||
      String(d.busNumber || "").trim() === "C1-TEST-01"
    ) {
      await adminDb.collection("buses").doc(doc.id).delete().catch(() => {});
      deletedCounts.buses++;
    }
  }

  // 8. Duplicate behavior records around 23 Nov 13:20 & 13:21
  const behSnap = await adminDb.collection("behavior").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  const seenNotes = new Set<string>();
  for (const doc of behSnap.docs) {
    const d = doc.data() || {};
    const note = `${d.studentId || ""}_${d.points || ""}_${d.notes || d.reason || ""}`;
    if (
      String(d.notes || d.reason || "").includes("Audit") ||
      String(d.notes || d.reason || "").includes("TEST")
    ) {
      await adminDb.collection("behavior").doc(doc.id).delete().catch(() => {});
      deletedCounts.behavior++;
    } else if (seenNotes.has(note)) {
      await adminDb.collection("behavior").doc(doc.id).delete().catch(() => {});
      deletedCounts.behavior++;
    } else {
      seenNotes.add(note);
    }
  }

  // 9. Parent login account parent.testguardianalpha@ghssahiwal.edu.pk
  const userSnap = await adminDb.collection("users").where("email", "==", "parent.testguardianalpha@ghssahiwal.edu.pk").get().catch(() => ({ docs: [] } as any));
  for (const doc of userSnap.docs) {
    await adminDb.collection("users").doc(doc.id).delete().catch(() => {});
    deletedCounts.users++;
  }
  try {
    const authUser = await adminAuth.getUserByEmail("parent.testguardianalpha@ghssahiwal.edu.pk");
    if (authUser?.uid) {
      await adminAuth.deleteUser(authUser.uid).catch(() => {});
      deletedCounts.users++;
    }
  } catch {}

  // 10. Test Student Alpha (preserving real students)
  const stSnap = await adminDb.collection("students").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of stSnap.docs) {
    const d = doc.data() || {};
    const name = String(d.fullName || d.name || "").trim();
    if (name.toLowerCase().includes("test student alpha")) {
      await adminDb.collection("students").doc(doc.id).delete().catch(() => {});
      deletedCounts.students++;
    }
  }

  // 11. Extra Test Teacher Alpha STF-002 (preserving real staff STF-001..STF-010)
  const sfSnap = await adminDb.collection("staff").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  for (const doc of sfSnap.docs) {
    const d = doc.data() || {};
    const name = String(d.fullName || d.name || d.personal?.fullName || "").trim();
    if (name.toLowerCase().includes("test teacher alpha")) {
      await adminDb.collection("staff").doc(doc.id).delete().catch(() => {});
      deletedCounts.staff++;
    }
  }

  // 12. Dummy Timetable Teachers cleanup & reconciliation with 10 real staff
  deletedCounts.timetable = 0;
  const DUMMY_TEACHERS = new Set([
    "Muhammad Aslam", "Fatima Noor", "Test Teacher Alpha", "Zahid Iqbal",
    "Nasreen Akhtar", "Rashid Mahmood", "Khadija Bibi", "Tariq Jamil", "Saima Bano"
  ]);
  const ttSnap = await adminDb.collection("timetable").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any));
  let needsReconcile = false;
  for (const doc of ttSnap.docs) {
    const t = doc.data()?.teacher;
    if (DUMMY_TEACHERS.has(t)) {
      await adminDb.collection("timetable").doc(doc.id).delete().catch(() => {});
      deletedCounts.timetable++;
      needsReconcile = true;
    }
  }

  return deletedCounts;
}

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (_req: Request, { tenantId }: TenantContext) => {
        const results = await runStuckDataCleanup(tenantId);
        return createSuccessResponse(results, { message: "Stuck test data cleaned up successfully" });
      })
    )
  )
);
