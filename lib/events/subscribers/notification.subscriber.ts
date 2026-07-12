// lib/events/subscribers/notification.subscriber.ts

import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";

export function registerNotificationSubscriber() {
  // 🎧 Listen for STUDENT_CREATED - notify admin of new admission
  eventBus.subscribe(EVENTS.STUDENT_CREATED, async (payload) => {
    try {
      const { tenantId, studentId, studentData } = payload;

      const adminSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .where("role", "in", ["admin", "super-admin"])
        .limit(5)
        .get();

      for (const doc of adminSnap.docs) {
        await doc.ref.collection("notifications").add({
          title: "New Student Enrolled",
          message: `${studentData?.fullName || "A new student"} has been enrolled in class ${studentData?.classGrade || "N/A"}.`,
          type: "info",
          isRead: false,
          link: `/students`,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error("Notification: Failed to send student created notification:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ADMISSION_APPROVED - notify parent of approval
  eventBus.subscribe(EVENTS.ADMISSION_APPROVED, async (payload) => {
    try {
      const { tenantId, studentId, studentData } = payload;

      // Find the parent linked to this student
      const parentSnap = await adminDb
        .collection("parents")
        .where("tenantId", "==", tenantId)
        .get();

      for (const doc of parentSnap.docs) {
        const parent = doc.data();
        if (parent?.studentIds?.includes(studentId) && parent?.email) {
          await adminDb
            .collection("tenants")
            .doc(tenantId)
            .collection("users")
            .where("uid", "==", doc.id)
            .limit(1)
            .get()
            .then(async (userSnap) => {
              for (const userDoc of userSnap.docs) {
                await userDoc.ref.collection("notifications").add({
                  title: "Admission Approved",
                  message: `Admission for ${studentData?.fullName || "your child"} has been approved.`,
                  type: "success",
                  isRead: false,
                  link: `/parent/dashboard`,
                  createdAt: new Date().toISOString(),
                });
              }
            });
        }
      }
    } catch (error) {
      logger.error("Notification: Failed to send admission approved notification:", { metadata: { error } });
    }
  });

  // 🎧 Listen for STUDENT_PROMOTED - notify admins
  eventBus.subscribe(EVENTS.STUDENT_PROMOTED, async (payload) => {
    try {
      const { tenantId, studentIds, newClassGrade, newSection } = payload;

      const adminSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .where("role", "in", ["admin", "super-admin"])
        .limit(5)
        .get();

      for (const doc of adminSnap.docs) {
        await doc.ref.collection("notifications").add({
          title: "Students Promoted",
          message: `${studentIds?.length || 0} students promoted to ${newClassGrade}-${newSection}.`,
          type: "success",
          isRead: false,
          link: `/students`,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error("Notification: Failed to send promotion notification:", { metadata: { error } });
    }
  });
  // 🎧 ایونٹ کو سنیں: جیسے ہی رپورٹس بن جائیں!
  eventBus.subscribe(EVENTS.REPORT_GENERATED, async (payload) => {
    try {
      const { tenantId, jobId } = payload;

      // 1. جاب (Job) کا ڈیٹا لائیں تاکہ پتہ چلے کہ یہ کس نے شروع کی تھی (کس ایڈمن یا پرنسپل نے)
      const jobSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("jobs")
        .doc(jobId)
        .get();

      if (!jobSnap.exists) return;
      
      const jobData = jobSnap.data();
      const userId = jobData?.createdBy;

      if (!userId) return;

      // 2. یوزر کے لیے ایک نیا ان-ایپ (In-App) نوٹیفکیشن بنائیں
      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .doc(userId)
        .collection("notifications")
        .add({
          title: "Reports Generated Successfully! 🎉",
          message: `Your bulk generation of ${jobData?.totalItems || 'all'} reports has been completed.`,
          type: "success", // فرنٹ اینڈ پر اسے سبز (Green) رنگ میں دکھانے کے لیے
          isRead: false,
          link: `/dashboard/reports?jobId=${jobId}`, // یوزر اس پر کلک کر کے ڈاؤن لوڈ والے پیج پر جا سکے گا
          createdAt: new Date().toISOString(),
        });

      logger.info(`Notification: Sent completion alert to user: ${userId}`);
    } catch (error) {
      logger.error("Notification: Failed to send notification:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ATTENDANCE_IMPORTED event - notify admin
  eventBus.subscribe(EVENTS.ATTENDANCE_IMPORTED, async (payload) => {
    try {
      const { tenantId, recordCount } = payload;

      // Find admin users for this tenant
      const adminSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .where("role", "in", ["admin", "super-admin"])
        .limit(5)
        .get();

      for (const doc of adminSnap.docs) {
        await doc.ref.collection("notifications").add({
          title: "Bulk Attendance Import Complete",
          message: `${recordCount} attendance records have been imported successfully.`,
          type: "success",
          isRead: false,
          link: "/attendance",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error("Notification: Failed to send attendance import notification:", { metadata: { error } });
    }
  });

  // 🎧 Listen for ASSIGNMENT_CREATED - notify teachers of new assignment
  eventBus.subscribe(EVENTS.ASSIGNMENT_CREATED, async (payload) => {
    try {
      const { tenantId, title, classGrade, subject } = payload;

      const adminSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .where("role", "in", ["admin", "super-admin"])
        .limit(5)
        .get();

      for (const doc of adminSnap.docs) {
        await doc.ref.collection("notifications").add({
          title: "New Assignment Created",
          message: `Assignment "${title}" created for class ${classGrade}, subject ${subject}.`,
          type: "info",
          isRead: false,
          link: "/teacher/assignments",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error("Notification: Failed to send assignment created notification:", { metadata: { error } });
    }
  });
}
