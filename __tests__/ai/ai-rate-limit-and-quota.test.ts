// __tests__/ai/ai-rate-limit-and-quota.test.ts
//
// PHASE 8 — AI Rate-Limiting, Tenant Token Quota Protection & Telemetry Verification

import { NextRequest } from "next/server";
import {
  enforceAiQuota,
  checkUserAiBurstLimit,
  checkTenantAiQuota,
  recordAiTelemetry,
  createAiErrorResponse,
  resetAiRateLimit,
} from "@/lib/ai/ai-quota-guard";
import { POST as agentsRoute } from "@/app/api/v1/ai/agents/route";
import { POST as chatbotRoute } from "@/app/api/v1/ai/chatbot/route";
import { POST as reportCommentsRoute } from "@/app/api/v1/ai/report-comments/route";
import { POST as smartBookCenterRoute } from "@/app/api/v1/ai/smart-book-center/route";
import { getSessionUser } from "@/lib/auth/auth-server";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";

// Mocks
jest.mock("@/lib/auth/auth-server", () => ({
  getSessionUser: jest.fn(),
}));

jest.mock("@/lib/ai/agents/AgentRegistry", () => ({
  agentRegistry: {
    listAgents: jest.fn().mockReturnValue(["principal", "teacher", "finance", "hr", "admission", "parent", "student"]),
    execute: jest.fn().mockResolvedValue("Mock AI generated response for testing"),
  },
  AgentNotFoundError: class AgentNotFoundError extends Error {},
}));

const mockSubscriptions: Record<string, any> = {};
const mockAiUsageDocs: any[] = [];

const mockDoc = (id: string, collectionName: string) => ({
  get: jest.fn().mockImplementation(async () => {
    if (collectionName === "subscriptions") {
      const data = mockSubscriptions[id];
      return {
        exists: !!data,
        data: () => data || null,
      };
    }
    return { exists: false, data: () => null };
  }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
});

const mockCollection = (name: string) => ({
  doc: jest.fn().mockImplementation((id: string) => mockDoc(id, name)),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  get: jest.fn().mockImplementation(async () => {
    if (name === "ai_usage") {
      return {
        size: mockAiUsageDocs.length,
        docs: mockAiUsageDocs.map((docData, i) => ({
          id: `usage_${i}`,
          data: () => docData,
        })),
      };
    }
    return { size: 0, docs: [] };
  }),
  add: jest.fn().mockImplementation(async (data: any) => {
    mockAiUsageDocs.push(data);
    return { id: `usage_${mockAiUsageDocs.length}` };
  }),
});

jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: (name: string) => mockCollection(name),
  },
  adminAuth: {
    verifySessionCookie: jest.fn(),
    verifyIdToken: jest.fn(),
  },
  dbTimestamp: new Date(),
}));

describe("Phase 8: AI Rate-Limiting & Tenant Quota Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAiRateLimit();
    for (const key of Object.keys(mockSubscriptions)) {
      delete mockSubscriptions[key];
    }
    mockAiUsageDocs.length = 0;
  });

  // =========================================================================
  // 1. AUTHENTICATION & TENANT VALIDATION
  // =========================================================================
  describe("1. Authentication & Tenant Validation", () => {
    it("rejects unauthenticated requests with 401 Unauthorized", async () => {
      const result = await enforceAiQuota(null);
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toBe("UNAUTHORIZED");
      expect(result.message).toMatch(/authentication required/i);
    });

    it("rejects requests from users without an active tenantId with 403 Forbidden", async () => {
      const result = await enforceAiQuota({ uid: "user_without_tenant", tenantId: null, role: "guest" });
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toBe("FORBIDDEN");
      expect(result.message).toMatch(/tenant assignment required/i);
    });
  });

  // =========================================================================
  // 2. PER-USER BURST RATE LIMITING (SLIDING WINDOW)
  // =========================================================================
  describe("2. Per-User Burst Rate Limiting", () => {
    it("allows up to 15 requests within 1 minute, and rejects the 16th with 429 RATE_LIMIT_EXCEEDED", async () => {
      const uid = "burst_test_user";

      // 15 requests allowed
      for (let i = 0; i < 15; i++) {
        const check = await checkUserAiBurstLimit(uid);
        expect(check.allowed).toBe(true);
      }

      // 16th request is blocked
      const blockedCheck = await checkUserAiBurstLimit(uid);
      expect(blockedCheck.allowed).toBe(false);
      expect(blockedCheck.retryAfterSeconds).toBeGreaterThan(0);
      expect(blockedCheck.retryAfterSeconds).toBeLessThanOrEqual(60);
    });

    it("enforces 429 response formatting with Retry-After header", async () => {
      const user = { uid: "burst_user_2", tenantId: "tenant_valid", role: "admin" };

      // Exhaust burst quota
      for (let i = 0; i < 15; i++) {
        await checkUserAiBurstLimit(user.uid);
      }

      const quotaResult = await enforceAiQuota(user, "chatbot");
      expect(quotaResult.allowed).toBe(false);
      expect(quotaResult.status).toBe(429);
      expect(quotaResult.error).toBe("RATE_LIMIT_EXCEEDED");
      expect(quotaResult.retryAfterSeconds).toBeDefined();

      const response = createAiErrorResponse(quotaResult);
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe(String(quotaResult.retryAfterSeconds));

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("RATE_LIMIT_EXCEEDED");
    });
  });

  // =========================================================================
  // 3. PER-TENANT MONTHLY QUOTA ENFORCEMENT
  // =========================================================================
  describe("3. Per-Tenant Monthly Quota Enforcement", () => {
    it("enforces Free tier quota of 50 calls/month", async () => {
      const tenantId = "tenant_free_tier";
      mockSubscriptions[tenantId] = {
        planId: "free",
        status: "active",
      };

      // Mock 50 existing usage calls
      for (let i = 0; i < 50; i++) {
        mockAiUsageDocs.push({ tenantId, success: true, createdAt: new Date() });
      }

      const quotaCheck = await checkTenantAiQuota(tenantId);
      expect(quotaCheck.allowed).toBe(false);
      expect(quotaCheck.status).toBe(402);
      expect(quotaCheck.error).toBe("AI_QUOTA_EXCEEDED");
      expect(quotaCheck.usage).toBe(50);
      expect(quotaCheck.limit).toBe(50);
    });

    it("allows Starter tier up to 500 calls/month and rejects at 500", async () => {
      const tenantId = "tenant_starter_tier";
      mockSubscriptions[tenantId] = {
        planId: "starter",
        status: "active",
      };

      // 499 calls -> allowed
      for (let i = 0; i < 499; i++) {
        mockAiUsageDocs.push({ tenantId, success: true, createdAt: new Date() });
      }

      const underCheck = await checkTenantAiQuota(tenantId);
      expect(underCheck.allowed).toBe(true);
      expect(underCheck.usage).toBe(499);
      expect(underCheck.limit).toBe(500);

      // Add 1 more -> 500 calls -> rejected
      mockAiUsageDocs.push({ tenantId, success: true, createdAt: new Date() });
      const atLimitCheck = await checkTenantAiQuota(tenantId);
      expect(atLimitCheck.allowed).toBe(false);
      expect(atLimitCheck.status).toBe(402);
      expect(atLimitCheck.usage).toBe(500);
      expect(atLimitCheck.limit).toBe(500);
    });

    it("blocks AI generation with 402 SUBSCRIPTION_INACTIVE if subscription status is canceled", async () => {
      const tenantId = "tenant_canceled";
      mockSubscriptions[tenantId] = {
        planId: "professional",
        status: "canceled",
      };

      const check = await checkTenantAiQuota(tenantId);
      expect(check.allowed).toBe(false);
      expect(check.status).toBe(402);
      expect(check.error).toBe("SUBSCRIPTION_INACTIVE");
      expect(check.message).toMatch(/canceled/i);
    });

    it("blocks AI generation with 402 SUBSCRIPTION_INACTIVE if subscription is unpaid or past_due", async () => {
      const tenantId = "tenant_unpaid";
      mockSubscriptions[tenantId] = {
        planId: "starter",
        status: "past_due",
      };

      const check = await checkTenantAiQuota(tenantId);
      expect(check.allowed).toBe(false);
      expect(check.status).toBe(402);
      expect(check.error).toBe("SUBSCRIPTION_INACTIVE");
    });
  });

  // =========================================================================
  // 4. ATOMIC TELEMETRY & ERROR METERING
  // =========================================================================
  describe("4. Atomic AI Telemetry & Error Metering", () => {
    it("does NOT count failed AI upstream calls toward tenant billable quota", async () => {
      const tenantId = "tenant_error_isolation";
      mockSubscriptions[tenantId] = {
        planId: "free",
        status: "active",
      };

      // Record 10 failed calls (upstream timeout / 500)
      for (let i = 0; i < 10; i++) {
        await recordAiTelemetry({
          tenantId,
          userId: "uid_1",
          featureKey: "copilot",
          success: false,
          error: "Upstream Gemini timeout",
        });
      }

      // Verify that billable quota calculation ignores failed records
      const quotaCheck = await checkTenantAiQuota(tenantId);
      expect(quotaCheck.allowed).toBe(true);
      expect(quotaCheck.usage).toBe(0);
      expect(quotaCheck.limit).toBe(50);
    });

    it("records telemetry entry with tokens, latency, provider, and model on success", async () => {
      const tenantId = "tenant_telemetry_verify";

      await recordAiTelemetry({
        tenantId,
        userId: "uid_telemetry_user",
        featureKey: "agent:principal",
        promptTokens: 120,
        completionTokens: 85,
        latencyMs: 340,
        success: true,
        provider: "gemini",
        model: "gemini-1.5-flash",
      });

      expect(mockAiUsageDocs.length).toBe(1);
      const recorded = mockAiUsageDocs[0];
      expect(recorded.tenantId).toBe(tenantId);
      expect(recorded.promptTokens).toBe(120);
      expect(recorded.completionTokens).toBe(85);
      expect(recorded.totalTokens).toBe(205);
      expect(recorded.latencyMs).toBe(340);
      expect(recorded.success).toBe(true);
    });
  });

  // =========================================================================
  // 5. END-TO-END AI ROUTE INVOCATION & REJECTION
  // =========================================================================
  describe("5. End-to-End AI Route Invocation & Protection", () => {
    it("POST /api/v1/ai/agents executes successfully and records telemetry when within quota", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "principal_user_1",
        email: "principal@school.edu",
        role: "admin",
        tenantId: "tenant_active_school",
      });

      mockSubscriptions["tenant_active_school"] = {
        planId: "professional",
        status: "active",
      };

      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        body: JSON.stringify({
          agentType: "principal",
          query: "Give me an operational summary for this month",
        }),
      });

      const res = await agentsRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.answer).toBe("Mock AI generated response for testing");
      expect(mockAiUsageDocs.length).toBe(1);
      expect(mockAiUsageDocs[0].success).toBe(true);
    });

    it("POST /api/v1/ai/agents returns 429 when burst limit is exceeded", async () => {
      const user = {
        uid: "spammer_user_1",
        email: "spammer@school.edu",
        role: "admin",
        tenantId: "tenant_burst_test",
      };
      (getSessionUser as jest.Mock).mockResolvedValue(user);

      mockSubscriptions[user.tenantId] = {
        planId: "enterprise",
        status: "active",
      };

      // Exhaust burst window
      for (let i = 0; i < 15; i++) {
        await checkUserAiBurstLimit(user.uid);
      }

      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        body: JSON.stringify({
          agentType: "principal",
          query: "Should be blocked by rate limit",
        }),
      });

      const res = await agentsRoute(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe("RATE_LIMIT_EXCEEDED");
      expect(res.headers.get("Retry-After")).toBeDefined();
    });

    it("POST /api/v1/ai/chatbot returns 402 when tenant monthly quota is exceeded", async () => {
      const user = {
        uid: "teacher_user_1",
        email: "teacher@school.edu",
        role: "teacher",
        tenantId: "tenant_quota_maxed",
      };
      (getSessionUser as jest.Mock).mockResolvedValue(user);

      mockSubscriptions[user.tenantId] = {
        planId: "free",
        status: "active",
      };

      // Populate 50 successful usage docs to max out Free plan
      for (let i = 0; i < 50; i++) {
        mockAiUsageDocs.push({
          tenantId: user.tenantId,
          success: true,
          createdAt: new Date(),
        });
      }

      const req = new NextRequest("http://localhost/api/v1/ai/chatbot", {
        method: "POST",
        body: JSON.stringify({
          question: "How do I teach fractions?",
        }),
      });

      const res = await chatbotRoute(req);
      const data = await res.json();

      expect(res.status).toBe(402);
      expect(data.error).toBe("AI_QUOTA_EXCEEDED");
      expect(data.message).toMatch(/monthly ai quota reached/i);
    });

    it("POST /api/v1/ai/report-comments returns 400 when missing required fields", async () => {
      const user = {
        uid: "teacher_user_2",
        email: "teacher2@school.edu",
        role: "teacher",
        tenantId: "tenant_valid",
      };
      (getSessionUser as jest.Mock).mockResolvedValue(user);

      mockSubscriptions[user.tenantId] = { planId: "free", status: "active" };

      const req = new NextRequest("http://localhost/api/v1/ai/report-comments", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const res = await reportCommentsRoute(req);
      expect(res.status).toBe(400);
    });

    it("POST /api/v1/ai/smart-book-center executes and returns result within quota", async () => {
      const user = {
        uid: "librarian_1",
        email: "librarian@school.edu",
        role: "admin",
        tenantId: "tenant_library",
      };
      (getSessionUser as jest.Mock).mockResolvedValue(user);

      mockSubscriptions[user.tenantId] = { planId: "starter", status: "active" };

      const req = new NextRequest("http://localhost/api/v1/ai/smart-book-center", {
        method: "POST",
        body: JSON.stringify({
          query: "recommend science books for class 5",
        }),
      });

      const res = await smartBookCenterRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result).toBe("Mock AI generated response for testing");
    });
  });
});

