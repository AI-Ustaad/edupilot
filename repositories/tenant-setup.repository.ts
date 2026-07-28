// repositories/tenant-setup.repository.ts
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import type { ITenantSetupRepository } from "@/interfaces/ITenantSetupRepository";

export class TenantSetupRepository implements ITenantSetupRepository {
  async setupSchool(input: {
    userId: string;
    tenantId: string;
    schoolName: string;
    type?: string;
    curriculum?: string;
    classes: any[];
    subjects: string[];
  }): Promise<void> {
    const { userId, tenantId, schoolName, type, curriculum, classes, subjects } = input;
    const now = new Date().toISOString();

    const batch = adminDb.batch();

    const userRef = adminDb.collection("users").doc(userId);
    batch.update(userRef, {
      onboardingRequired: false,
      role: "admin",
      tenantId,
      updatedAt: new Date(),
    });

    const tenantRef = adminDb.collection("tenants").doc(tenantId);
    batch.set(tenantRef, {
      name: schoolName,
      type: type || "Private",
      curriculum: curriculum || "custom",
      ownerId: userId,
      status: "active",
      createdAt: new Date(),
    }, { merge: true });

    const settingsRef = adminDb.collection("tenants").doc(tenantId).collection("settings").doc("config");
    batch.set(settingsRef, {
      classes,
      subjects,
      gradingRules: [
        { grade: "A++", min: 90, max: 100 },
        { grade: "A+", min: 80, max: 89 },
        { grade: "A", min: 70, max: 79 },
        { grade: "B", min: 60, max: 69 },
        { grade: "C", min: 50, max: 59 },
        { grade: "D", min: 40, max: 49 },
        { grade: "F", min: 0, max: 39 },
      ],
      examTerms: [
        { name: "First Term", order: 1, active: true },
        { name: "Midterm", order: 2, active: true },
        { name: "Final Term", order: 3, active: true },
      ],
      feeCategories: [
        { name: "Tuition", description: "Monthly tuition fee", active: true },
        { name: "Exam Fee", description: "Examination fee", active: true },
        { name: "Transport", description: "Transport fee", active: true },
      ],
      promotionRules: { minPercentage: 40, autoPromote: false },
      shifts: [{ name: "Morning", startTime: "07:30", endTime: "12:30" }],
      periods: Array.from({ length: 8 }, (_, i) => ({ name: `Period ${i + 1}`, order: i + 1, duration: 40 })),
      houses: [
        { name: "Red", color: "#EF4444" },
        { name: "Blue", color: "#3B82F6" },
        { name: "Green", color: "#22C55E" },
        { name: "Yellow", color: "#EAB308" },
      ],
      attendanceRules: { lateMinutes: 15, autoAbsent: false, workingDays: [1, 2, 3, 4, 5, 6] },
      examWeightages: { midterm: 30, final: 50, assignment: 20 },
      assessmentTypes: [
        { name: "Written Exam", active: true },
        { name: "Oral Test", active: true },
        { name: "Practical", active: true },
        { name: "Assignment", active: true },
      ],
      feeStructures: [],
      timetableSlots: { periodsPerDay: 8, daysPerWeek: 6, breakAfterPeriod: 4 },
      notificationTemplates: { welcomeEmail: true, feeReminder: true, attendanceAlert: true },
      aiConfig: { provider: "gemini", autoInsights: false },
      dashboardConfig: { refreshInterval: 300, showAnalytics: true },
      defaultRoles: ["admin", "teacher", "student", "parent"],
      featureFlags: { aiEnabled: false, smsEnabled: false, emailEnabled: true },
      updatedAt: now,
    }, { merge: true });

    const sectionsRef = adminDb.collection("sections");
    const oldSections = await sectionsRef.where("tenantId", "==", tenantId).get();
    oldSections.docs.forEach(doc => batch.delete(doc.ref));

    classes.forEach((cls: any) => {
      if (cls.name) {
        const newSecRef = sectionsRef.doc();
        batch.set(newSecRef, {
          tenantId,
          classGrade: cls.name,
          sectionName: "A",
          createdAt: now,
        });
      }
    });

    const defaultDepartments = [
      { name: "Admin", description: "Administrative department", tenantId, createdAt: now },
      { name: "Academic", description: "Teaching and academic staff", tenantId, createdAt: now },
      { name: "Support", description: "Support and maintenance staff", tenantId, createdAt: now },
    ];
    defaultDepartments.forEach(dept => {
      const deptRef = adminDb.collection("departments").doc();
      batch.set(deptRef, dept);
    });

    const defaultDesignations = [
      { name: "Principal", description: "School principal", tenantId, createdAt: now },
      { name: "Vice-Principal", description: "Vice principal", tenantId, createdAt: now },
      { name: "HOD", description: "Head of department", tenantId, createdAt: now },
      { name: "Teacher", description: "Class teacher", tenantId, createdAt: now },
    ];
    defaultDesignations.forEach(desig => {
      const desigRef = adminDb.collection("designations").doc();
      batch.set(desigRef, desig);
    });

    const campusRef = adminDb.collection("campuses").doc();
    batch.set(campusRef, {
      name: "Main Campus",
      address: "",
      phone: "",
      tenantId,
      isMain: true,
      createdAt: now,
    });

    await batch.commit();
  }
}
