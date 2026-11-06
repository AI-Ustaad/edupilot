// lib/ai/ai-quota-guard.ts
// Centralized Sliding-Window Rate Limiter, Tenant Quota Guard & Telemetry Metering for AI services.

import { NextResponse } from "next/server";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/config/subscription-plans";
import { logger } from "@/lib/logger/logger";
import { aiRateLimit } from "@/lib/ratelimit";

export interface AiQuotaResult {
  allowed: boolean;
  status?: number;
  error?: "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMIT_EXCEEDED" | "AI_QUOTA_EXCEEDED" | "SUBSCRIPTION_INACTIVE";
  message?: string;
  retryAfterSeconds?: number;
  usage?: number;
  limit?: number;
  tenantId?: string;
  userId?: string;
}

export interface AiTelemetryEntry {
  tenantId: string;
  userId: string;
  featureKey?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
  success: boolean;
  error?: string | null;
  provider?: string;
  model?: string;
}

// In-memory sliding window request timestamps per UID: uid -> Array<epochMs>
const userBurstWindow = new Map<string, number[]>();
const WINDOW_DURATION_MS = 60 * 1000; // 1 minute
const MAX_BURST_REQUESTS_PER_MINUTE = 15;

/**
 * Resets sliding-window state (useful for test isolation).
 */
export function resetAiRateLimit(uid?: string) {
  if (uid) {
    userBurstWindow.delete(uid);
  } else {
    userBurstWindow.clear();
  }
}

/**
 * Evaluates per-user burst rate limiting within a 60-second sliding window.
 */
export async function checkUserAiBurstLimit(
  uid: string,
  maxRequests: number = MAX_BURST_REQUESTS_PER_MINUTE
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const now = Date.now();
  const windowStart = now - WINDOW_DURATION_MS;

  // 1. Check Upstash Redis limiter if active
  if (aiRateLimit) {
    try {
      const res = await aiRateLimit.limit(`ai:burst:${uid}`);
      if (!res.success) {
        const retryAfter = Math.max(1, Math.ceil((res.reset - now) / 1000));
        return { allowed: false, retryAfterSeconds: retryAfter };
      }
    } catch (e) {
      // Fallback to in-memory window if Redis connection fails
    }
  }

  // 2. Sliding-window in-memory guard
  const timestamps = userBurstWindow.get(uid) || [];
  const validTimestamps = timestamps.filter((ts) => ts > windowStart);

  if (validTimestamps.length >= maxRequests) {
    const oldestTimestamp = validTimestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldestTimestamp + WINDOW_DURATION_MS - now) / 1000));
    userBurstWindow.set(uid, validTimestamps);
    return { allowed: false, retryAfterSeconds: retryAfter };
  }

  validTimestamps.push(now);
  userBurstWindow.set(uid, validTimestamps);
  return { allowed: true };
}

/**
 * Calculates current month start in UTC.
 */
function getStartOfMonth(): Date {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Validates tenant subscription status and monthly AI usage limit.
 */
export async function checkTenantAiQuota(
  tenantId: string
): Promise<{ allowed: boolean; status?: number; error?: any; message?: string; usage?: number; limit?: number }> {
  try {
    const subDoc = await adminDb.collection("subscriptions").doc(tenantId).get();
    let planId = "free";
    let status = "active";
    let customQuota: number | undefined;

    if (subDoc.exists) {
      const subData = subDoc.data() || {};
      planId = subData.planId || subData.planTier || "free";
      status = subData.status || subData.subscriptionStatus || "active";
      if (typeof subData.limits?.maxAiQuota === "number") {
        customQuota = subData.limits.maxAiQuota;
      } else if (typeof subData.limits?.aiMonthlyQuota === "number") {
        customQuota = subData.limits.aiMonthlyQuota;
      }
    }

    // 1. Subscription active validation
    if (status === "canceled") {
      return {
        allowed: false,
        status: 402,
        error: "SUBSCRIPTION_INACTIVE",
        message: "Your subscription is canceled. Please reactivate your plan to use AI features.",
        usage: 0,
        limit: 0,
      };
    }

    if (status === "unpaid" || status === "past_due") {
      return {
        allowed: false,
        status: 402,
        error: "SUBSCRIPTION_INACTIVE",
        message: "Your subscription payment is unpaid or past due. Please update billing to use AI features.",
        usage: 0,
        limit: 0,
      };
    }

    // 2. Resolve quota ceiling
    const plan = PLANS[planId] || PLANS.free;
    const maxQuota = typeof customQuota === "number" ? customQuota : (plan.maxAiQuota ?? 50);

    // 3. Count billable invocations for current calendar month (only successful AI calls count)
    const startOfMonth = getStartOfMonth();
    const usageSnapshot = await adminDb
      .collection("ai_usage")
      .where("tenantId", "==", tenantId)
      .where("createdAt", ">=", startOfMonth)
      .get();

    // Exclude records explicitly marked as failed
    const currentUsage = usageSnapshot.docs.filter((d) => d.data()?.success !== false).length;

    if (currentUsage >= maxQuota) {
      return {
        allowed: false,
        status: 402,
        error: "AI_QUOTA_EXCEEDED",
        message: "Monthly AI quota reached for your current plan. Upgrade your subscription to unlock additional AI capacity.",
        usage: currentUsage,
        limit: maxQuota,
      };
    }

    return {
      allowed: true,
      usage: currentUsage,
      limit: maxQuota,
    };
  } catch (err: any) {
    logger.error("Error evaluating tenant AI quota:", { metadata: { error: err.message, tenantId } });
    // Fail safe with free tier defaults
    return {
      allowed: true,
      usage: 0,
      limit: 50,
    };
  }
}

/**
 * Deterministic multi-layered AI quota and rate-limit guard.
 */
export async function enforceAiQuota(
  sessionUser: { uid?: string; tenantId?: string | null; role?: string } | null | undefined,
  featureKey: string = "general",
  estimatedTokens: number = 0
): Promise<AiQuotaResult> {
  // 1. Authentication Check
  if (!sessionUser || !sessionUser.uid) {
    return {
      allowed: false,
      status: 401,
      error: "UNAUTHORIZED",
      message: "Authentication required to access AI services.",
    };
  }

  // 2. Tenant Assignment Check
  if (!sessionUser.tenantId) {
    return {
      allowed: false,
      status: 403,
      error: "FORBIDDEN",
      message: "Tenant assignment required to access AI services.",
      userId: sessionUser.uid,
    };
  }

  const { uid, tenantId } = sessionUser;

  // 3. Per-User Burst Rate Limiter Check (15 req/min)
  const burstCheck = await checkUserAiBurstLimit(uid);
  if (!burstCheck.allowed) {
    return {
      allowed: false,
      status: 429,
      error: "RATE_LIMIT_EXCEEDED",
      message: "Too many AI requests. Please wait a moment before trying again.",
      retryAfterSeconds: burstCheck.retryAfterSeconds,
      tenantId,
      userId: uid,
    };
  }

  // 4. Per-Tenant Monthly Quota & Subscription Status Check
  const tenantCheck = await checkTenantAiQuota(tenantId);
  if (!tenantCheck.allowed) {
    return {
      allowed: false,
      status: tenantCheck.status || 402,
      error: tenantCheck.error || "AI_QUOTA_EXCEEDED",
      message: tenantCheck.message || "Monthly AI quota reached for your current plan.",
      usage: tenantCheck.usage,
      limit: tenantCheck.limit,
      tenantId,
      userId: uid,
    };
  }

  return {
    allowed: true,
    tenantId,
    userId: uid,
    usage: tenantCheck.usage,
    limit: tenantCheck.limit,
  };
}

/**
 * Creates standardized HTTP JSON response for AI quota rejections.
 */
export function createAiErrorResponse(result: AiQuotaResult): NextResponse {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (result.retryAfterSeconds) {
    headers["Retry-After"] = String(result.retryAfterSeconds);
  }

  return NextResponse.json(
    {
      success: false,
      error: result.error,
      message: result.message,
      retryAfterSeconds: result.retryAfterSeconds,
      usage: result.usage,
      limit: result.limit,
    },
    {
      status: result.status || 400,
      headers,
    }
  );
}

/**
 * Records atomic AI telemetry and usage metering.
 * Upstream errors do NOT penalize tenant billable quota.
 */
export async function recordAiTelemetry(entry: AiTelemetryEntry): Promise<void> {
  try {
    const {
      tenantId,
      userId,
      featureKey = "general",
      promptTokens = 0,
      completionTokens = 0,
      totalTokens,
      latencyMs = 0,
      success,
      error = null,
      provider = "gemini",
      model = "gemini-1.5-flash",
    } = entry;

    const computedTotalTokens = typeof totalTokens === "number" ? totalTokens : promptTokens + completionTokens;

    await adminDb.collection("ai_usage").add({
      tenantId,
      userId,
      featureKey,
      promptTokens,
      completionTokens,
      totalTokens: computedTotalTokens,
      latencyMs,
      success,
      error,
      provider,
      model,
      createdAt: new Date(),
      timestamp: new Date(),
    });
  } catch (err: any) {
    logger.error("Failed to record AI telemetry:", { metadata: { error: err.message, tenantId: entry.tenantId } });
  }
}

