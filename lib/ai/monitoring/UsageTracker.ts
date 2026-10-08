// lib/ai/monitoring/UsageTracker.ts
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "@/lib/logger/logger";
import { SubscriptionLimitException } from "@/errors/AppError";

export interface UsageRecord {
  tenantId: string;
  userId: string;
  provider: string;
  model: string;
  tokens?: number;
  promptTokens?: number;
  latencyMs: number;
  success: boolean;
  error?: string;
  documentType?: string;
}

export class UsageTracker {
  async checkQuota(
    tenantId: string,
    customQuota?: number
  ): Promise<{ allowed: boolean; used: number; quota: number }> {
    if (!tenantId || tenantId.trim() === "") {
      throw new SubscriptionLimitException("Tenant ID is required for AI operations.");
    }

    try {
      let quota = typeof customQuota === "number" ? customQuota : 1000;
      if (typeof customQuota !== "number") {
        try {
          const configDoc = await adminDb
            .collection("tenants")
            .doc(tenantId)
            .collection("settings")
            .doc("configuration")
            .get();
          if (configDoc.exists) {
            const cfg = configDoc.data();
            if (typeof cfg?.features?.ai?.quota === "number") {
              quota = cfg.features.ai.quota;
            }
          }
        } catch {
          // Default quota if settings lookup fails
        }
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const snapshot = await adminDb
        .collection("ai_usage")
        .where("tenantId", "==", tenantId)
        .where("timestamp", ">=", startOfMonth)
        .get();

      const used = snapshot.size;

      if (used >= quota) {
        throw new SubscriptionLimitException(
          `AI quota exceeded for tenant ${tenantId} (${used}/${quota} used). Upgrade plan for more quota.`
        );
      }

      return { allowed: true, used, quota };
    } catch (err) {
      if (err instanceof SubscriptionLimitException) {
        throw err;
      }
      logger.error("[UsageTracker] Error checking quota:", { metadata: { error: err, tenantId } });
      return { allowed: true, used: 0, quota: 1000 };
    }
  }

  async track(record: UsageRecord): Promise<void> {
    try {
      await adminDb.collection("ai_usage").add({
        ...record,
        estimatedCost: this.estimateCost(record.provider, record.tokens ?? 0),
        timestamp: FieldValue.serverTimestamp(),
      });
    } catch (err) {
      logger.error("[UsageTracker] Failed to record usage:", { metadata: { error: err } });
    }
  }

  async queryByTenant(
    tenantId: string,
    options?: { limit?: number; provider?: string; fromDate?: Date }
  ) {
    try {
      let query: FirebaseFirestore.Query = adminDb
        .collection("ai_usage")
        .where("tenantId", "==", tenantId)
        .orderBy("timestamp", "desc");

      if (options?.provider) {
        query = query.where("provider", "==", options.provider);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      logger.error("[UsageTracker] Failed to query usage:", { metadata: { error: err } });
      return [];
    }
  }

  private estimateCost(provider: string, tokens: number): number {
    const rates: Record<string, number> = {
      gemini: 0.0001,
      claude: 0.003,
      openai: 0.002,
      vertex: 0.002,
      azure: 0.002,
    };
    const rate = rates[provider.toLowerCase()] ?? 0.001;
    return tokens * rate;
  }
}
