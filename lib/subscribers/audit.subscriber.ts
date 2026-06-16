// lib/events/subscribers/audit.subscriber.ts

import { eventBus } from "../event-bus";
import { EVENTS } from "../event-types";
import { adminDb } from "@/lib/firebase-admin";

export function registerAuditSubscriber() {
  // 🎧 Listen for STUDENT_CREATED event
  eventBus.subscribe(EVENTS.STUDENT_CREATED, async (payload) => {
    try {
      const { tenantId, studentId, studentData } = payload;

      // 📝 Write to Audit Logs in the background
      await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("audit_logs")
        .add({
          action: "STUDENT_CREATED",
          targetId: studentId,
          details: `Student ${studentData.firstName || 'Unknown'} was enrolled into the system.`,
          timestamp: new Date().toISOString(),
          module: "Students",
          systemAction: true, // یہ بتائے گا کہ یہ کام Event Bus نے بیک گراؤنڈ میں کیا ہے
        });

      console.log(`✅ [Audit Subscriber] Successfully logged creation of student: ${studentId}`);
    } catch (error) {
      console.error("❌ [Audit Subscriber] Failed to log event:", error);
    }
  });

  // مستقبل میں ہم یہاں FEES اور ATTENDANCE کے ایونٹس بھی شامل کر سکتے ہیں...
}
