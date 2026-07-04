// services/telemetry.service.ts
import { adminDb } from "@/lib/firebase-admin";

export class TelemetryService {
  async getSaaSMetrics() {
    // 1. تمام اسکولز (Tenants) Fetch کریں
    const tenantsSnap = await adminDb.collection("tenants").get();
    const totalSchools = tenantsSnap.size;

    let activeSubscriptions = 0;
    let trialSubscriptions = 0;
    let mrr = 0; // Monthly Recurring Revenue

    const planPrices: Record<string, number> = {
      basic: 2000,
      pro: 3000,
      enterprise: 5000,
      free: 0
    };

    // 2. Subscriptions اور MRR Calculate کریں
    const subsSnap = await adminDb.collection("subscriptions").get();
    subsSnap.forEach(doc => {
      const sub = doc.data();
      if (sub.status === "active") {
        activeSubscriptions++;
        mrr += planPrices[sub.planId] || 0;
      } else if (sub.status === "trialing") {
        trialSubscriptions++;
      }
    });

    // 3. Daily Active Users (DAU) - لوگ جنہوں نے آج Login کیا
    const today = new Date().toISOString().split('T')[0];
    const logsSnap = await adminDb.collection("audit_logs")
      .where("action", "==", "user.login")
      .where("timestamp", ">=", new Date(today))
      .get();
    
    const uniqueUserIds = new Set(logsSnap.docs.map(doc => doc.data().userId));
    const dau = uniqueUserIds.size;

    // 4. System Health (Placeholder for Sentry/Vercel API integration later)
    const systemHealth = {
      apiStatus: "Operational",
      databaseLatency: "120ms",
      errorRate: "0.2%",
    };

    return {
      totalSchools,
      activeSubscriptions,
      trialSubscriptions,
      mrr,
      dau,
      systemHealth,
      // Mock Trend Data for Charts (Original میں یہ Firestore Aggregation سے آئے گا)
      revenueTrend: [
        { month: "Jan", revenue: mrr * 0.8 },
        { month: "Feb", revenue: mrr * 0.9 },
        { month: "Mar", revenue: mrr },
      ]
    };
  }
}
