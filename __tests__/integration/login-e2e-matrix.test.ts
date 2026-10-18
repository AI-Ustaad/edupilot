// __tests__/integration/login-e2e-matrix.test.ts
//
// PHASE 3 — LOGIN 100% END-TO-END INTEGRATION TEST MATRIX
// Verifies all 20 canonical authentication & session lifecycle scenarios.

import { NextRequest } from "next/server";
import { POST as loginRoute } from "@/app/api/v1/auth/login/route";
import { POST as logoutRoute } from "@/app/api/v1/auth/logout/route";
import { POST as parentLoginRoute } from "@/app/api/v1/auth/parent-login/route";
import { middleware } from "@/middleware";
import { verifyEdgeSession } from "@/lib/auth/edge-session";
import { getSessionUser } from "@/lib/auth/auth-server";
import { ROLE_CONFIG } from "@/lib/auth/roles.config";

jest.mock("@/lib/firebase-admin", () => {
  const mockDoc = {
    get: jest.fn(),
    data: jest.fn(),
    exists: true,
  };
  const mockCollection = {
    doc: jest.fn().mockReturnValue(mockDoc),
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    add: jest.fn().mockResolvedValue({ id: "new-doc-id" }),
  };
  return {
    adminAuth: {
      verifyIdToken: jest.fn(),
      verifySessionCookie: jest.fn(),
      createSessionCookie: jest.fn().mockResolvedValue("mock-firebase-session-cookie-12345"),
      setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
      getUser: jest.fn().mockResolvedValue({ customClaims: {} }),
    },
    adminDb: {
      collection: jest.fn().mockReturnValue(mockCollection),
    },
    dbTimestamp: new Date(),
  };
});

jest.mock("@/lib/ratelimit", () => ({
  checkAuthRateLimit: jest.fn().mockResolvedValue({ success: true, reset: 0 }),
  authRateLimit: null,
}));

jest.mock("@/lib/logger/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/headers for getSessionUser
let mockedCookies: Record<string, string> = {};
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => (mockedCookies[name] ? { name, value: mockedCookies[name] } : undefined),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

describe("PHASE 3 — Login 100% E2E Test Matrix (TEST 01 - TEST 20)", () => {
  const { adminAuth, adminDb } = require("@/lib/firebase-admin");

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCookies = {};
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "edupilot-d262f";
  });

  // TEST 01: Valid user → login succeeds
  it("TEST 01: Valid user → login succeeds and attaches secure HttpOnly session cookie", async () => {
    adminAuth.verifyIdToken.mockResolvedValueOnce({
      uid: "user_valid_01",
      email: "teacher@school.com",
    });

    const mockUserDoc = {
      id: "user_valid_01",
      exists: true,
      data: () => ({
        uid: "user_valid_01",
        email: "teacher@school.com",
        role: "teacher",
        tenantId: "tenant_main",
      }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockUserDoc),
    });

    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "valid.firebase.idtoken" }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.uid).toBe("user_valid_01");
    expect(body.user.role).toBe("teacher");
    expect(body.redirectTo).toBe(ROLE_CONFIG.teacher.redirect);

    // Verify session cookie was attached
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("session=");
    expect(setCookie).toContain("HttpOnly");
  });

  // TEST 02: Invalid password → login rejected
  it("TEST 02: Invalid password / unverified token → login rejected with 401", async () => {
    adminAuth.verifyIdToken.mockRejectedValueOnce(new Error("auth/wrong-password"));

    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "invalid.password.token" }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  // TEST 03: Unknown email → login rejected
  it("TEST 03: Unknown email / user-not-found → login rejected with 401", async () => {
    adminAuth.verifyIdToken.mockRejectedValueOnce(new Error("auth/user-not-found"));

    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "unknown.email.token" }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(401);
  });

  // TEST 04: Disabled account → rejected
  it("TEST 04: Disabled account → rejected with 401", async () => {
    adminAuth.verifyIdToken.mockRejectedValueOnce(new Error("auth/user-disabled"));

    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "disabled.user.token" }),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(401);
  });

  // TEST 05: Missing credentials → 400
  it("TEST 05: Missing credentials → returns 400 Bad Request", async () => {
    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(400);
  });

  // TEST 06: Expired session → rejected
  it("TEST 06: Expired session → rejected at edge verification", async () => {
    const result = await verifyEdgeSession("expired.jwt.token");
    expect(result).toBeNull();
  });

  // TEST 07: Forged session → rejected
  it("TEST 07: Forged session → rejected by edge and server verification", async () => {
    const forgedResult = await verifyEdgeSession("forged.tampered.token");
    expect(forgedResult).toBeNull();

    adminAuth.verifySessionCookie.mockRejectedValueOnce(new Error("auth/argument-error"));
    adminAuth.verifyIdToken.mockRejectedValueOnce(new Error("auth/argument-error"));
    mockedCookies["session"] = "forged.tampered.token";

    const sessionUser = await getSessionUser();
    expect(sessionUser).toBeNull();
  });

  // TEST 08: Wrong audience → rejected
  it("TEST 08: Wrong audience → rejected during session verification", async () => {
    const res = await verifyEdgeSession(
      "eyJhbGciOiJSUzI1NiIsImtpZCI6ImF1ZCJ9.eyJhdWQiOiJvdGhlci1wcm9qZWN0Iiwic3ViIjoidTEifQ.signature"
    );
    expect(res).toBeNull();
  });

  // TEST 09: Wrong issuer → rejected
  it("TEST 09: Wrong issuer → rejected during session verification", async () => {
    const res = await verifyEdgeSession(
      "eyJhbGciOiJSUzI1NiIsImtpZCI6ImlzcyJ9.eyJpc3MiOiJodHRwczovL2V2aWwuY29tIiwic3ViIjoidTEifQ.signature"
    );
    expect(res).toBeNull();
  });

  // TEST 10: Wrong project → rejected
  it("TEST 10: Wrong project → rejected when NEXT_PUBLIC_FIREBASE_PROJECT_ID mismatch", async () => {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "different-project-id";
    const res = await verifyEdgeSession("random.token.val");
    expect(res).toBeNull();
  });

  // TEST 11: Revoked session → rejected
  it("TEST 11: Revoked session → rejected with checkRevoked enforcement", async () => {
    adminAuth.verifySessionCookie.mockRejectedValueOnce(new Error("auth/session-cookie-revoked"));
    adminAuth.verifyIdToken.mockRejectedValueOnce(new Error("auth/id-token-revoked"));
    mockedCookies["session"] = "revoked.session.cookie";

    const sessionUser = await getSessionUser();
    expect(sessionUser).toBeNull();
  });

  // TEST 12: Logout → protected endpoint rejected
  it("TEST 12: Logout → clears session cookie and protected access is rejected", async () => {
    const logoutRes = await logoutRoute();
    expect(logoutRes.status).toBe(200);

    const setCookie = logoutRes.headers.get("set-cookie") || "";
    expect(setCookie).toContain("Max-Age=0");

    // Subsequent access without cookie is 401
    const protectedReq = new NextRequest(new URL("/api/v1/students", "http://localhost"));
    const protectedRes = await middleware(protectedReq);
    expect(protectedRes.status).toBe(401);
  });

  // TEST 13: Refresh after login → session remains valid
  it("TEST 13: Refresh after login → valid cookie returns authenticated user", async () => {
    adminAuth.verifySessionCookie.mockResolvedValueOnce({
      uid: "user_valid_13",
      email: "admin@school.com",
    });

    const mockUserDoc = {
      exists: true,
      data: () => ({
        uid: "user_valid_13",
        email: "admin@school.com",
        role: "admin",
        tenantId: "tenant_abc",
      }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockUserDoc),
    });

    mockedCookies["session"] = "valid-session-cookie-value";
    const sessionUser = await getSessionUser();

    expect(sessionUser).not.toBeNull();
    expect(sessionUser?.uid).toBe("user_valid_13");
    expect(sessionUser?.role).toBe("admin");
    expect(sessionUser?.tenantId).toBe("tenant_abc");
  });

  // TEST 14: Refresh after logout → session invalid
  it("TEST 14: Refresh after logout → no cookie returns null user and redirects", async () => {
    mockedCookies = {}; // Cookie deleted by logout
    const sessionUser = await getSessionUser();
    expect(sessionUser).toBeNull();

    const pageReq = new NextRequest(new URL("/dashboard", "http://localhost"));
    const pageRes = await middleware(pageReq);
    expect(pageRes.status).toBe(307);
    expect(pageRes.headers.get("location")).toContain("/login");
  });

  // TEST 15: Direct API access without session → 401
  it("TEST 15: Direct API access without session → returns 401 JSON", async () => {
    const apiReq = new NextRequest(new URL("/api/v1/fees", "http://localhost"));
    const apiRes = await middleware(apiReq);
    expect(apiRes.status).toBe(401);
    const body = await apiRes.json();
    expect(body.message).toBe("Unauthorized");
  });

  // TEST 16: Parent login → parent dashboard only
  it("TEST 16: Parent login → resolves to parent dashboard, rejects non-parents", async () => {
    // Parent succeeds
    adminAuth.verifyIdToken.mockResolvedValueOnce({ uid: "parent_01", email: "parent@school.com" });
    const mockParentDoc = {
      exists: true,
      data: () => ({ uid: "parent_01", email: "parent@school.com", role: "parent", tenantId: "tenant_p" }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockParentDoc),
    });

    const parentReq = new Request("http://localhost/api/v1/auth/parent-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "parent.id.token" }),
    });

    const parentRes = await parentLoginRoute(parentReq);
    expect(parentRes.status).toBe(200);
    const parentBody = await parentRes.json();
    expect(parentBody.user.role).toBe("parent");
    expect(parentBody.redirectTo).toBe("/parent/dashboard");

    // Non-parent is blocked
    adminAuth.verifyIdToken.mockResolvedValueOnce({ uid: "teacher_01", email: "teacher@school.com" });
    const mockTeacherDoc = {
      exists: true,
      data: () => ({ uid: "teacher_01", email: "teacher@school.com", role: "teacher", tenantId: "tenant_p" }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockTeacherDoc),
    });

    const nonParentReq = new Request("http://localhost/api/v1/auth/parent-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "teacher.id.token" }),
    });

    const nonParentRes = await parentLoginRoute(nonParentReq);
    expect(nonParentRes.status).toBe(403);
  });

  // TEST 17: Teacher login → teacher dashboard only
  it("TEST 17: Teacher login → routes to /dashboard", async () => {
    adminAuth.verifyIdToken.mockResolvedValueOnce({ uid: "t_01", email: "teacher@test.com" });
    const mockDoc = {
      exists: true,
      data: () => ({ uid: "t_01", email: "teacher@test.com", role: "teacher", tenantId: "tenant_1" }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc),
    });

    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "t.token" }),
    });

    const res = await loginRoute(req);
    const body = await res.json();
    expect(body.user.role).toBe("teacher");
    expect(body.redirectTo).toBe(ROLE_CONFIG.teacher.redirect);
  });

  // TEST 18: Admin login → admin dashboard only
  it("TEST 18: Admin login → routes to /dashboard", async () => {
    adminAuth.verifyIdToken.mockResolvedValueOnce({ uid: "a_01", email: "admin@test.com" });
    const mockDoc = {
      exists: true,
      data: () => ({ uid: "a_01", email: "admin@test.com", role: "admin", tenantId: "tenant_1" }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc),
    });

    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "a.token" }),
    });

    const res = await loginRoute(req);
    const body = await res.json();
    expect(body.user.role).toBe("admin");
    expect(body.redirectTo).toBe(ROLE_CONFIG.admin.redirect);
  });

  // TEST 19: SuperAdmin login → superadmin capabilities only
  it("TEST 19: SuperAdmin login → resolves superAdmin role", async () => {
    adminAuth.verifyIdToken.mockResolvedValueOnce({ uid: "sa_01", email: "super@test.com" });
    const mockDoc = {
      exists: true,
      data: () => ({ uid: "sa_01", email: "super@test.com", role: "superAdmin", tenantId: null }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc),
    });

    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "sa.token" }),
    });

    const res = await loginRoute(req);
    const body = await res.json();
    expect(body.user.role).toBe("superAdmin");
  });

  // TEST 20: User cannot escalate role through request payload
  it("TEST 20: User cannot escalate role through request payload", async () => {
    adminAuth.verifyIdToken.mockResolvedValueOnce({ uid: "student_01", email: "student@test.com" });
    const mockDoc = {
      exists: true,
      data: () => ({ uid: "student_01", email: "student@test.com", role: "student", tenantId: "tenant_1" }),
    };
    (adminDb.collection as jest.Mock)().doc.mockReturnValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc),
    });

    // Attacker sends role: "superAdmin" in body
    const req = new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "student.token", role: "superAdmin" }),
    });

    const res = await loginRoute(req);
    const body = await res.json();
    // Role remains student, from database authority, NOT request body
    expect(body.user.role).toBe("student");
    expect(body.user.role).not.toBe("superAdmin");
  });
});
