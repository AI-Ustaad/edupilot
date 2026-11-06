// __tests__/e2e/critical-journeys-smoke.test.ts
//
// PHASE 8 — Critical Journeys End-to-End Smoke Verification Suite
// Covers:
//   Journey 1: Public & Health Baseline
//   Journey 2: Auth & Middleware Boundary Enforcement
//   Journey 3: Onboarding to Dashboard Provisioning Flow
//   Journey 4: Core Admin & Billing Operations
//   Journey 5: AI Copilot & Quota Guard Flow

import { NextRequest } from "next/server";
import { GET as healthRoute } from "@/app/api/health/route";
import { middleware } from "@/middleware";
import { verifyEdgeSession } from "@/lib/auth/edge-session";
import { getSessionUser } from "@/lib/auth/auth-server";
import { POST as registerSchoolRoute } from "@/app/api/v1/users/register-school/route";
import { POST as sessionRoute } from "@/app/api/v1/auth/session/route";
import { POST as agentsRoute } from "@/app/api/v1/ai/agents/route";
import { POST as createCheckoutRoute } from "@/app/api/v1/stripe/create-checkout/route";
import { GET as subscriptionsRoute } from "@/app/api/v1/subscriptions/route";
import { GET as adminUsersRoute } from "@/app/api/v1/admin/users/route";
import { POST as createUserRoute } from "@/app/api/v1/create-user/route";
import { resetAiRateLimit, checkUserAiBurstLimit } from "@/lib/ai/ai-quota-guard";

// Mocks
jest.mock("@/lib/auth/auth-server", () => ({
  getSessionUser: jest.fn(),
}));

jest.mock("@/lib/auth/edge-session", () => ({
  verifyEdgeSession: jest.fn(),
}));

jest.mock("@/lib/ai/agents/AgentRegistry", () => ({
  agentRegistry: {
    listAgents: jest.fn().mockReturnValue(["principal", "teacher", "finance", "hr"]),
    execute: jest.fn().mockResolvedValue("Executive Summary: School operations are optimal."),
  },
  AgentNotFoundError: class AgentNotFoundError extends Error {},
}));

const mockStripeSessionsCreate = jest.fn().mockResolvedValue({
  id: "cs_test_smoke_session_123",
  url: "https://checkout.stripe.com/c/pay/cs_test_smoke_session_123",
});

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: (...args: any[]) => mockStripeSessionsCreate(...args),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

const mockSubscriptionsData: Record<string, any> = {};
const mockAiUsageDocs: any[] = [];
const mockUsersData: any[] = [];

const mockDoc = (id: string, colName: string): any => ({
  id,
  get: jest.fn().mockImplementation(async () => {
    if (colName === "subscriptions") {
      const data = mockSubscriptionsData[id];
      return { exists: !!data, data: () => data || null };
    }
    return { exists: true, data: () => ({ id, role: "admin", tenantId: "tenant_smoke_test" }) };
  }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  collection: jest.fn().mockImplementation((subName: string) => mockCollection(`${colName}/${id}/${subName}`)),
});

const mockCollection = (colName: string): any => ({
  doc: jest.fn().mockImplementation((id?: string) => mockDoc(id || `doc_${Date.now()}`, colName)),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  count: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
  }),
  get: jest.fn().mockImplementation(async () => {
    if (colName === "ai_usage") {
      return {
        size: mockAiUsageDocs.length,
        docs: mockAiUsageDocs.map((docData, i) => ({
          id: `usage_${i}`,
          data: () => docData,
        })),
      };
    }
    if (colName === "users") {
      return {
        empty: mockUsersData.length === 0,
        docs: mockUsersData.map((u, i) => ({ id: `u_${i}`, data: () => u })),
      };
    }
    return { size: 0, docs: [] };
  }),
  add: jest.fn().mockImplementation(async (data: any) => {
    if (colName === "ai_usage") mockAiUsageDocs.push(data);
    if (colName === "users") mockUsersData.push(data);
    return { id: `doc_${Date.now()}` };
  }),
});

jest.mock("@/lib/firebase-admin", () => {
  const mockBatch = {
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  };
  return {
    adminDb: {
      collection: (col: string) => mockCollection(col),
      batch: () => mockBatch,
    },
    adminAuth: {
      createUser: jest.fn().mockResolvedValue({ uid: "user_created_123", email: "teacher.smoke@school.edu" }),
      setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
      createSessionCookie: jest.fn().mockResolvedValue("mock_refreshed_session_cookie"),
      verifySessionCookie: jest.fn(),
      verifyIdToken: jest.fn(),
    },
    dbTimestamp: new Date(),
  };
});

describe("Phase 8: Critical Journeys End-to-End Smoke Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAiRateLimit();
    mockAiUsageDocs.length = 0;
    mockUsersData.length = 0;
    for (const key of Object.keys(mockSubscriptionsData)) {
      delete mockSubscriptionsData[key];
    }
  });

  // =========================================================================
  // JOURNEY 1: Public & Health Baseline
  // =========================================================================
  describe("Journey 1 — Public & Health Baseline", () => {
    it("/api/health returns HTTP 200 with status: healthy", async () => {
      const res = await healthRoute();
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.status).toBe("healthy");
      expect(body.timestamp).toBeDefined();
      expect(typeof body.uptime).toBe("number");
    });

    it("public routes (/login, /signup, /onboarding) pass through middleware without redirect", async () => {
      for (const publicPath of ["/login", "/signup", "/onboarding"]) {
        const req = new NextRequest(`http://localhost${publicPath}`);
        const res = await middleware(req);
        expect(res.status).toBe(200);
        expect(res.headers.get("location")).toBeNull();
      }
    });
  });

  // =========================================================================
  // JOURNEY 2: Auth & Middleware Boundary Enforcement
  // =========================================================================
  describe("Journey 2 — Auth & Middleware Boundary Enforcement", () => {
    it("redirects unauthenticated browser navigation on protected paths to /login?redirect=...", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue(null);

      const protectedPages = [
        "/dashboard",
        "/admin/users",
        "/ai/principal-copilot",
        "/settings/billing",
      ];

      for (const pagePath of protectedPages) {
        const req = new NextRequest(`http://localhost${pagePath}`);
        const res = await middleware(req);

        expect(res.status).toBe(307); // redirect
        const location = res.headers.get("location") || "";
        expect(location).toContain("/login");
        expect(location).toContain(`redirect=${encodeURIComponent(pagePath)}`);
      }
    });

    it("returns HTTP 401 Unauthorized for unauthenticated API requests", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/v1/students");
      const res = await middleware(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/unauthorized/i);
    });

    it("redirects unauthorized roles (e.g. parent visiting /admin) to /dashboard?error=unauthorized", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue({
        uid: "parent_smoke_user",
        email: "parent@school.com",
        role: "parent",
        tenantId: "tenant_smoke_1",
      });

      const req = new NextRequest("http://localhost/admin/users", {
        headers: { cookie: "session=valid_parent_token" },
      });

      const res = await middleware(req);
      expect(res.status).toBe(307);
      const location = res.headers.get("location") || "";
      expect(location).toContain("/dashboard");
      expect(location).toContain("error=unauthorized");
    });
  });

  // =========================================================================
  // JOURNEY 3: Onboarding to Dashboard Provisioning Flow
  // =========================================================================
  describe("Journey 3 — Onboarding to Dashboard Provisioning Flow", () => {
    it("provisions tenant for guest user and enables direct dashboard access", async () => {
      const guestUser = {
        uid: "new_onboarding_founder",
        email: "founder@school.org",
        role: "guest",
        tenantId: null,
      };
      (getSessionUser as jest.Mock).mockResolvedValue(guestUser);

      // 1. Post to register-school
      const registerReq = new NextRequest("http://localhost/api/v1/users/register-school", {
        method: "POST",
        body: JSON.stringify({
          schoolName: "EduPilot Smoke High School",
          type: "Private School",
          curriculum: "Single National Curriculum (SNC)",
        }),
      });

      const registerRes = await registerSchoolRoute(registerReq);
      const registerData = await registerRes.json();

      expect(registerRes.status).toBe(200);
      expect(registerData.success).toBe(true);
      const newTenantId = registerData.data.tenantId;
      expect(newTenantId).toBeDefined();

      // 2. Client exchanges refreshed token for updated session cookie
      const sessionReq = new Request("http://localhost/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "freshly_provisioned_admin_token" }),
      });

      const sessionRes = await sessionRoute(sessionReq);
      expect(sessionRes.status).toBe(200);
      expect(sessionRes.headers.get("set-cookie")).toContain("session=mock_refreshed_session_cookie");

      // 3. User accesses /dashboard with provisioned claims
      (verifyEdgeSession as jest.Mock).mockResolvedValue({
        uid: guestUser.uid,
        email: guestUser.email,
        role: "admin",
        tenantId: newTenantId,
      });

      const dashboardReq = new NextRequest("http://localhost/dashboard", {
        headers: { cookie: "session=mock_refreshed_session_cookie" },
      });

      const dashboardRes = await middleware(dashboardReq);
      expect(dashboardRes.status).toBe(200);
      expect(dashboardRes.headers.get("location")).toBeNull();
    });
  });

  // =========================================================================
  // JOURNEY 4: Core Admin & Billing Operations
  // =========================================================================
  describe("Journey 4 — Core Admin & Billing Operations", () => {
    const adminUser = {
      uid: "smoke_admin_1",
      email: "admin@edupilot.test",
      role: "admin",
      tenantId: "tenant_smoke_billing",
    };

    beforeEach(() => {
      (getSessionUser as jest.Mock).mockResolvedValue(adminUser);
      mockSubscriptionsData[adminUser.tenantId] = {
        planId: "free",
        tier: "free",
        status: "active",
        limits: { students: 50, staff: 10, maxAiQuota: 50 },
      };
    });

    it("fetches active subscription and plan quota meters", async () => {
      const req = new NextRequest("http://localhost/api/v1/subscriptions");
      const res = await subscriptionsRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.planId).toBe("free");
      expect(data.data.limits.students).toBe(50);
      expect(data.data.limits.staff).toBe(10);
    });

    it("creates an invited user profile via /api/v1/create-user", async () => {
      const req = new NextRequest("http://localhost/api/v1/create-user", {
        method: "POST",
        body: JSON.stringify({
          email: "teacher.smoke@school.edu",
          password: "SecurePassword123!",
          role: "teacher",
        }),
      });

      const res = await createUserRoute(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.user.email).toBe("teacher.smoke@school.edu");
    });

    it("creates a Stripe Checkout Session for subscription upgrade", async () => {
      const req = new NextRequest("http://localhost/api/v1/stripe/create-checkout", {
        method: "POST",
        body: JSON.stringify({ planId: "starter" }),
      });

      const res = await createCheckoutRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.url).toContain("checkout.stripe.com");
      expect(mockStripeSessionsCreate).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // JOURNEY 5: AI Copilot & Quota Guard Flow
  // =========================================================================
  describe("Journey 5 — AI Copilot & Quota Guard Flow", () => {
    const aiUser = {
      uid: "smoke_principal_ai",
      email: "principal.ai@school.edu",
      role: "admin",
      tenantId: "tenant_ai_journey",
    };

    beforeEach(() => {
      (getSessionUser as jest.Mock).mockResolvedValue(aiUser);
      mockSubscriptionsData[aiUser.tenantId] = {
        planId: "free",
        status: "active",
      };
    });

    it("executes AI copilot successfully and records telemetry when within quota", async () => {
      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        body: JSON.stringify({
          agentType: "principal",
          query: "Summarize school risks",
        }),
      });

      const res = await agentsRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.answer).toContain("optimal");
      expect(mockAiUsageDocs.length).toBe(1);
    });

    it("rejects with HTTP 429 when per-user burst rate limit is breached", async () => {
      // Exhaust 15 requests
      for (let i = 0; i < 15; i++) {
        await checkUserAiBurstLimit(aiUser.uid);
      }

      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        body: JSON.stringify({
          agentType: "principal",
          query: "Spam query",
        }),
      });

      const res = await agentsRoute(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toBe("RATE_LIMIT_EXCEEDED");
      expect(res.headers.get("Retry-After")).toBeDefined();
    });

    it("rejects with HTTP 402 when monthly tenant AI quota is exhausted", async () => {
      // Exhaust 50 Free tier monthly calls
      for (let i = 0; i < 50; i++) {
        mockAiUsageDocs.push({
          tenantId: aiUser.tenantId,
          success: true,
          createdAt: new Date(),
        });
      }

      const req = new NextRequest("http://localhost/api/v1/ai/agents", {
        method: "POST",
        body: JSON.stringify({
          agentType: "principal",
          query: "Query exceeding quota",
        }),
      });

      const res = await agentsRoute(req);
      const data = await res.json();

      expect(res.status).toBe(402);
      expect(data.error).toBe("AI_QUOTA_EXCEEDED");
      expect(data.message).toMatch(/monthly ai quota reached/i);
    });
  });
});
