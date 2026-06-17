// lib/events/subscribers/notification.subscriber.ts

import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { adminDb } from "@/lib/firebase-admin";

export function registerNotificationSubscriber() {
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

      console.log(`✅ [Notification Subscriber] Sent completion alert to user: ${userId}`);
    } catch (error) {
      console.error("❌ [Notification Subscriber] Failed to send notification:", error);
    }
  });
}
