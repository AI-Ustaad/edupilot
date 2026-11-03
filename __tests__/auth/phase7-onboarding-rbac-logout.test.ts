// __tests__/auth/phase7-onboarding-rbac-logout.test.ts
//
// PHASE 7 — 100% COMPLIANCE TEST SUITE
// Covers Onboarding Tenant Provisioning, Custom Claims, Multi-Tenant Anti-IDOR,
// Path-Level RBAC Enforcement, and Session Revocation / Logout.

import { NextRequest } from "next/server";
import { POST as registerSchoolRoute } from "@/app/api/v1/users/register-school/route";
import { POST as sessionPostRoute, DELETE as sessionDeleteRoute } from "@/app/api/v1/auth/session/route";
import { POST as logoutPostRoute } from "@/app/api/v1/auth/logout/route";
import { middleware } from "@/middleware";
import { verifyEdgeSession } from "@/lib/auth/edge-session";
import { getSessionUser } from "@/lib/auth/auth-server";
import {
  isSuperAdmin,
  isTenantAdmin,
  isTeacher,
  isParent,
  isStudent,
  validateTenantAccess,
  enforceTenantScope,
  checkRouteRole,
} from "@/lib/auth/rbac-guard";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";

// Mocks
jest.mock("@/lib/auth/auth-server", () => ({
  getSessionUser: jest.fn(),
}));

jest.mock("@/lib/auth/edge-session", () => ({
  verifyEdgeSession: jest.fn(),
}));

const mockSetCustomUserClaims = jest.fn().mockResolvedValue(undefined);
const mockRevokeRefreshTokens = jest.fn().mockResolvedValue(undefined);
const mockVerifySessionCookie = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockCreateSessionCookie = jest.fn().mockResolvedValue("mock-session-cookie-val");

const mockBatch = {
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  commit: jest.fn().mockResolvedValue(undefined),
};

const mockDoc: any = {
  get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
};

const mockCollection: any = {
  doc: jest.fn().mockReturnValue(mockDoc),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
  add: jest.fn().mockResolvedValue({ id: "mock_ay_id_123" }),
};

mockDoc.collection = jest.fn().mockReturnValue(mockCollection);

jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    setCustomUserClaims: (...args: any[]) => mockSetCustomUserClaims(...args),
    revokeRefreshTokens: (...args: any[]) => mockRevokeRefreshTokens(...args),
    verifySessionCookie: (...args: any[]) => mockVerifySessionCookie(...args),
    verifyIdToken: (...args: any[]) => mockVerifyIdToken(...args),
    createSessionCookie: (...args: any[]) => mockCreateSessionCookie(...args),
  },
  adminDb: {
    batch: () => mockBatch,
    collection: () => mockCollection,
  },
  dbTimestamp: new Date(),
}));

jest.mock("@/lib/events", () => ({
  eventBus: {
    publish: jest.fn(),
  },
}));

describe("Phase 7: Onboarding Tenant Provisioning, Multi-Tenant RBAC & Session Revocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. ONBOARDING & TENANT PROVISIONING (POST /api/v1/users/register-school)
  // =========================================================================
  describe("1. Onboarding & Tenant Provisioning", () => {
    it("rejects unauthenticated request with 401 Unauthorized", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/v1/users/register-school", {
        method: "POST",
        body: JSON.stringify({ schoolName: "Beaconhouse School" }),
      });

      const res = await registerSchoolRoute(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error || data.message).toMatch(/unauthorized/i);
    });

    it("rejects request missing schoolName with 400 Bad Request", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "guest_user_123",
        email: "guest@edupilot.test",
        role: "guest",
      });

      const req = new NextRequest("http://localhost/api/v1/users/register-school", {
        method: "POST",
        body: JSON.stringify({ schoolName: "   " }),
      });

      const res = await registerSchoolRoute(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("atomically provisions tenant, user profile, free subscription, and custom claims", async () => {
      const uid = "onboarding_user_999";
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid,
        email: "founder@school.edu",
        role: "guest",
        tenantId: null,
      });

      const req = new NextRequest("http://localhost/api/v1/users/register-school", {
        method: "POST",
        body: JSON.stringify({
          schoolName: "EduPilot Academy",
          type: "Private School",
          curriculum: "Single National Curriculum (SNC)",
          phone: "0300-1234567",
        }),
      });

      const res = await registerSchoolRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.tenantId).toBeDefined();
      expect(data.data.schoolName).toBe("EduPilot Academy");

      // Verify custom claims are set
      expect(mockSetCustomUserClaims).toHaveBeenCalledWith(
        uid,
        expect.objectContaining({
          tenantId: data.data.tenantId,
          schoolId: data.data.tenantId,
          role: "admin",
        })
      );

      // Verify domain event published
      expect(eventBus.publish).toHaveBeenCalledWith(
        EVENTS.SCHOOL_SETUP_COMPLETED,
        expect.objectContaining({
          tenantId: data.data.tenantId,
          schoolName: "EduPilot Academy",
          createdBy: uid,
        }),
        data.data.tenantId
      );
    });
  });

  // =========================================================================
  // 2. CLIENT SESSION REFRESH (POST /api/v1/auth/session)
  // =========================================================================
  describe("2. Client Session Cookie Exchange", () => {
    it("exchanges refreshed ID token for 5-day HttpOnly session cookie", async () => {
      mockCreateSessionCookie.mockResolvedValue("new_session_cookie_with_admin_claims");

      const req = new Request("http://localhost/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "freshly_minted_id_token_with_claims" }),
      });

      const res = await sessionPostRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);

      const setCookieHeader = res.headers.get("set-cookie");
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain("session=new_session_cookie_with_admin_claims");
      expect(setCookieHeader?.toLowerCase()).toContain("httponly");
      expect(setCookieHeader?.toLowerCase()).toContain("samesite=lax");
    });
  });

  // =========================================================================
  // 3. SESSION REVOCATION & LOGOUT (POST /logout & DELETE /session)
  // =========================================================================
  describe("3. Session Revocation & Logout", () => {
    it("POST /api/v1/auth/logout revokes refresh tokens and clears session cookie", async () => {
      mockVerifySessionCookie.mockResolvedValue({ uid: "user_to_logout_123" });

      const req = new NextRequest("http://localhost/api/v1/auth/logout", {
        method: "POST",
        headers: {
          cookie: "session=active_session_token_123",
        },
      });

      const res = await logoutPostRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRevokeRefreshTokens).toHaveBeenCalledWith("user_to_logout_123");

      const setCookieHeader = res.headers.get("set-cookie");
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain("Max-Age=0");
    });

    it("DELETE /api/v1/auth/session revokes refresh tokens and clears session cookie", async () => {
      mockVerifySessionCookie.mockResolvedValue({ uid: "user_to_logout_456" });

      const req = new Request("http://localhost/api/v1/auth/session", {
        method: "DELETE",
        headers: {
          cookie: "session=active_session_token_456",
        },
      });

      const res = await sessionDeleteRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRevokeRefreshTokens).toHaveBeenCalledWith("user_to_logout_456");

      const setCookieHeader = res.headers.get("set-cookie");
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain("Max-Age=0");
    });

    it("handles logout when session token is already expired/missing without 500 error", async () => {
      const req = new NextRequest("http://localhost/api/v1/auth/logout", {
        method: "POST",
      });

      const res = await logoutPostRoute(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // =========================================================================
  // 4. MULTI-TENANT DATA ISOLATION & ANTI-IDOR ENFORCEMENT
  // =========================================================================
  describe("4. Multi-Tenant Data Isolation & Anti-IDOR", () => {
    it("validateTenantAccess allows super-admin cross-tenant access", () => {
      expect(validateTenantAccess("tenant_alpha", "tenant_beta", "superAdmin")).toBe(true);
      expect(validateTenantAccess("tenant_alpha", "tenant_beta", "super-admin")).toBe(true);
      expect(validateTenantAccess(null, "tenant_beta", "superAdmin")).toBe(true);
    });

    it("validateTenantAccess permits access only to matching tenant for non-super-admins", () => {
      expect(validateTenantAccess("tenant_123", "tenant_123", "admin")).toBe(true);
      expect(validateTenantAccess("tenant_123", "tenant_123", "teacher")).toBe(true);
      expect(validateTenantAccess("tenant_123", "tenant_456", "admin")).toBe(false);
      expect(validateTenantAccess("tenant_123", "tenant_456", "teacher")).toBe(false);
      expect(validateTenantAccess("tenant_123", "tenant_456", "parent")).toBe(false);
      expect(validateTenantAccess(null, "tenant_456", "admin")).toBe(false);
    });

    it("enforceTenantScope strictly returns user.tenantId and ignores requested tenant for non-super-admins", () => {
      const normalUser = { tenantId: "tenant_legitimate", role: "admin" };
      const attackerTenantId = "tenant_victim";

      const scopedTenantId = enforceTenantScope(normalUser, attackerTenantId);
      expect(scopedTenantId).toBe("tenant_legitimate");
    });

    it("enforceTenantScope honors requested tenantId only for super-admin", () => {
      const superAdminUser = { tenantId: "system", role: "superAdmin" };
      const targetTenantId = "tenant_target_school";

      const scopedTenantId = enforceTenantScope(superAdminUser, targetTenantId);
      expect(scopedTenantId).toBe(targetTenantId);
    });
  });

  // =========================================================================
  // 5. PATH-LEVEL RBAC BOUNDARIES & MIDDLEWARE ENFORCEMENT
  // =========================================================================
  describe("5. Path-Level RBAC Boundaries", () => {
    it("super-admin paths (/super-admin/*): allowed only for superAdmin", () => {
      expect(checkRouteRole("/super-admin/tenants", "superAdmin").allowed).toBe(true);
      expect(checkRouteRole("/super-admin/tenants", "super-admin").allowed).toBe(true);
      expect(checkRouteRole("/super-admin/tenants", "admin").allowed).toBe(false);
      expect(checkRouteRole("/super-admin/tenants", "teacher").allowed).toBe(false);
      expect(checkRouteRole("/super-admin/tenants", "parent").allowed).toBe(false);
      expect(checkRouteRole("/super-admin/tenants", "student").allowed).toBe(false);
      expect(checkRouteRole("/super-admin/tenants", "guest").allowed).toBe(false);
    });

    it("admin & billing paths (/admin/*, /settings/billing): allowed for admin & principal, blocked for teacher/parent/student", () => {
      expect(checkRouteRole("/admin/users", "admin").allowed).toBe(true);
      expect(checkRouteRole("/admin/users", "schoolAdmin").allowed).toBe(true);
      expect(checkRouteRole("/admin/users", "principal").allowed).toBe(true);
      expect(checkRouteRole("/admin/users", "superAdmin").allowed).toBe(true);

      expect(checkRouteRole("/admin/users", "teacher").allowed).toBe(false);
      expect(checkRouteRole("/admin/users", "parent").allowed).toBe(false);
      expect(checkRouteRole("/admin/users", "student").allowed).toBe(false);
      expect(checkRouteRole("/settings/billing", "teacher").allowed).toBe(false);
      expect(checkRouteRole("/settings/billing", "parent").allowed).toBe(false);

      // Onboarding exception for /admin/school-setup
      expect(checkRouteRole("/admin/school-setup", "guest").allowed).toBe(true);
    });

    it("teacher paths (/teacher/*): allowed for teacher and admin, blocked for parent/student", () => {
      expect(checkRouteRole("/teacher/classes", "teacher").allowed).toBe(true);
      expect(checkRouteRole("/teacher/classes", "admin").allowed).toBe(true);
      expect(checkRouteRole("/teacher/classes", "principal").allowed).toBe(true);
      expect(checkRouteRole("/teacher/classes", "parent").allowed).toBe(false);
      expect(checkRouteRole("/teacher/classes", "student").allowed).toBe(false);
      expect(checkRouteRole("/teacher/classes", "guest").allowed).toBe(false);
    });

    it("parent paths (/parent/*): allowed for parent and admin, blocked for teacher and student", () => {
      expect(checkRouteRole("/parent/fees", "parent").allowed).toBe(true);
      expect(checkRouteRole("/parent/fees", "admin").allowed).toBe(true);
      expect(checkRouteRole("/parent/fees", "teacher").allowed).toBe(false);
      expect(checkRouteRole("/parent/fees", "student").allowed).toBe(false);
    });

    it("middleware redirects unauthorized page navigations to /dashboard?error=unauthorized", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue({
        uid: "teacher_uid_1",
        email: "teacher@school.com",
        role: "teacher",
        tenantId: "tenant_1",
      });

      // Teacher attempting to navigate to /admin/payroll
      const req = new NextRequest("http://localhost/admin/payroll", {
        headers: { cookie: "session=valid_teacher_session" },
      });

      const res = await middleware(req);
      expect(res.status).toBe(307); // redirect
      const location = res.headers.get("location") || "";
      expect(location).toContain("/dashboard");
      expect(location).toContain("error=unauthorized");
    });

    it("middleware returns 403 JSON for unauthorized API calls", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue({
        uid: "parent_uid_1",
        email: "parent@home.com",
        role: "parent",
        tenantId: "tenant_1",
      });

      // Parent attempting to call /api/v1/billing endpoint
      const req = new NextRequest("http://localhost/api/v1/billing/invoices", {
        headers: { cookie: "session=valid_parent_session" },
      });

      const res = await middleware(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe("FORBIDDEN");
      expect(data.message).toMatch(/insufficient role permissions/i);
    });
  });

  // =========================================================================
  // 6. ROLE HELPER MATRIX
  // =========================================================================
  describe("6. Role Helper Matrix Validation", () => {
    it("isSuperAdmin validates super-admin roles", () => {
      expect(isSuperAdmin("superAdmin")).toBe(true);
      expect(isSuperAdmin("super_admin")).toBe(true);
      expect(isSuperAdmin("super-admin")).toBe(true);
      expect(isSuperAdmin("admin")).toBe(false);
      expect(isSuperAdmin("teacher")).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
    });

    it("isTenantAdmin validates admin and principal roles", () => {
      expect(isTenantAdmin("admin")).toBe(true);
      expect(isTenantAdmin("schoolAdmin")).toBe(true);
      expect(isTenantAdmin("principal")).toBe(true);
      expect(isTenantAdmin("superAdmin")).toBe(true);
      expect(isTenantAdmin("teacher")).toBe(false);
      expect(isTenantAdmin("parent")).toBe(false);
    });

    it("isTeacher, isParent, isStudent validate role hierarchies", () => {
      expect(isTeacher("teacher")).toBe(true);
      expect(isTeacher("admin")).toBe(true);
      expect(isTeacher("parent")).toBe(false);

      expect(isParent("parent")).toBe(true);
      expect(isParent("admin")).toBe(true);
      expect(isParent("teacher")).toBe(false);

      expect(isStudent("student")).toBe(true);
      expect(isStudent("admin")).toBe(true);
      expect(isStudent("teacher")).toBe(false);
    });
  });
});
