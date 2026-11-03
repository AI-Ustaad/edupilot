import { mapAuthError } from "@/lib/auth/auth-client";
import { POST as loginRoute } from "@/app/api/v1/auth/login/route";
import { POST as sessionRoute } from "@/app/api/v1/auth/session/route";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { verifyEdgeSession } from "@/lib/auth/edge-session";

jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

const mockGetUser = jest.fn().mockResolvedValue({ customClaims: {} });
const mockVerifyIdToken = jest.fn();
const mockVerifySessionCookie = jest.fn();
const mockCreateSessionCookie = jest.fn().mockResolvedValue("mock_session_cookie_val");
const mockSetCustomUserClaims = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/firebase-admin", () => {
  return {
    adminAuth: {
      getUser: (...args: any[]) => mockGetUser(...args),
      verifyIdToken: (...args: any[]) => mockVerifyIdToken(...args),
      verifySessionCookie: (...args: any[]) => mockVerifySessionCookie(...args),
      createSessionCookie: (...args: any[]) => mockCreateSessionCookie(...args),
      setCustomUserClaims: (...args: any[]) => mockSetCustomUserClaims(...args),
    },
    adminDb: {
      collection: jest.fn(),
    },
    dbTimestamp: { toDate: () => new Date() },
  };
});

jest.mock("@/lib/ratelimit", () => ({
  checkAuthRateLimit: jest.fn().mockResolvedValue({ success: true, reset: 0 }),
}));

jest.mock("@/lib/auth/edge-session", () => ({
  verifyEdgeSession: jest.fn(),
}));

describe("Phase 6: Authentication Audit, OAuth Integration & Session Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ customClaims: {} });
    mockCreateSessionCookie.mockResolvedValue("mock_session_cookie_val");
  });

  describe("1. Error Code Mapping (mapAuthError)", () => {
    it("maps auth/invalid-credential to friendly error", () => {
      const msg = mapAuthError({ code: "auth/invalid-credential" });
      expect(msg).toBe("Invalid email or password. Please verify your credentials.");
    });

    it("maps auth/user-not-found to friendly error", () => {
      const msg = mapAuthError({ code: "auth/user-not-found" });
      expect(msg).toBe("Invalid email or password. Please verify your credentials.");
    });

    it("maps auth/wrong-password to friendly error", () => {
      const msg = mapAuthError({ code: "auth/wrong-password" });
      expect(msg).toBe("Invalid email or password. Please verify your credentials.");
    });

    it("maps auth/too-many-requests to lock notification", () => {
      const msg = mapAuthError({ code: "auth/too-many-requests" });
      expect(msg).toContain("Too many failed attempts");
    });

    it("maps auth/user-disabled to administrator notice", () => {
      const msg = mapAuthError({ code: "auth/user-disabled" });
      expect(msg).toContain("This user account has been disabled");
    });

    it("maps auth/popup-closed-by-user and auth/popup-blocked", () => {
      expect(mapAuthError({ code: "auth/popup-closed-by-user" })).toContain("Sign-in popup was closed");
      expect(mapAuthError({ code: "auth/popup-blocked" })).toContain("Sign-in popup was blocked");
    });

    it("maps auth/account-exists-with-different-credential with customData email", () => {
      const msg = mapAuthError({
        code: "auth/account-exists-with-different-credential",
        customData: { email: "teacher@gmail.com" },
      });
      expect(msg).toContain("teacher@gmail.com");
      expect(msg).toContain("using Google or Email/Password");
    });
  });

  describe("2. Server Session & Token Exchange (/api/v1/auth/login)", () => {
    it("exchanges valid ID token for secure session cookie and returns user profile", async () => {
      const { adminDb } = require("@/lib/firebase-admin");

      mockVerifyIdToken.mockResolvedValue({
        uid: "user_test_1",
        email: "admin@edupilot.test",
        role: "admin",
        tenantId: "tenant_main",
      });

      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            id: "user_test_1",
            data: () => ({
              email: "admin@edupilot.test",
              role: "admin",
              tenantId: "tenant_main",
              onboardingRequired: false,
            }),
          }),
        }),
      });

      const req = new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "valid_id_token_123" }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user.uid).toBe("user_test_1");
      expect(json.user.tenantId).toBe("tenant_main");
      expect(json.redirectTo).toBe("/dashboard");

      // Verify session cookie was attached
      const setCookieHeader = res.headers.get("set-cookie");
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain("session=");
      expect(setCookieHeader).toContain("HttpOnly");
      expect(setCookieHeader?.toLowerCase()).toContain("samesite=lax");
    });

    it("redirects new OAuth sign-ins without tenant to /onboarding", async () => {
      const { adminDb } = require("@/lib/firebase-admin");

      mockVerifyIdToken.mockResolvedValue({
        uid: "new_oauth_user",
        email: "newprincipal@gmail.com",
      });

      let userCreated = false;

      adminDb.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockImplementation(() => {
            if (!userCreated) {
              return Promise.resolve({ exists: false });
            }
            return Promise.resolve({
              exists: true,
              id: "new_oauth_user",
              data: () => ({
                email: "newprincipal@gmail.com",
                role: "admin",
                tenantId: null,
                onboardingRequired: true,
              }),
            });
          }),
          set: jest.fn().mockImplementation(() => {
            userCreated = true;
            return Promise.resolve({});
          }),
        }),
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
        }),
      });

      const req = new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "new_oauth_id_token" }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user.uid).toBe("new_oauth_user");
      expect(json.user.tenantId).toBeNull();
      // Must redirect to onboarding setup when no tenant exists
      expect(json.redirectTo).toBe("/onboarding");
    });

    it("rejects invalid or expired token with 401 Unauthorized", async () => {
      mockVerifyIdToken.mockRejectedValue(new Error("Firebase ID token has expired."));

      const req = new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "expired_token_123" }),
      });

      const res = await loginRoute(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.code).toBe("INVALID_TOKEN");
    });
  });

  describe("3. Refresh Session Endpoint (/api/v1/auth/session)", () => {
    it("accepts token from body and sets fresh session cookie", async () => {
      const req = new Request("http://localhost/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "refreshed_id_token_xyz" }),
      });

      const res = await sessionRoute(req);
      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("session=");
      expect(setCookie).toContain("HttpOnly");
    });

    it("accepts token from Authorization: Bearer header", async () => {
      const req = new Request("http://localhost/api/v1/auth/session", {
        method: "POST",
        headers: { 
          "Authorization": "Bearer token_from_bearer_header",
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({}),
      });

      const res = await sessionRoute(req);
      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain("session=");
    });

    it("returns 400 when token is omitted from both body and header", async () => {
      const req = new Request("http://localhost/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await sessionRoute(req);
      expect(res.status).toBe(400);
    });
  });

  describe("4. Edge Middleware Session Verification & Route Redirection", () => {
    it("allows request to proceed when session cookie contains valid verified token", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue({
        uid: "authenticated_user_1",
        email: "staff@school.com",
      });

      const req = new NextRequest("http://localhost/dashboard", {
        headers: {
          cookie: "session=valid_edge_session_token",
        },
      });

      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });

    it("allows request to proceed when Authorization: Bearer header is valid", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue({
        uid: "api_bearer_user_1",
        email: "api@school.com",
      });

      const req = new NextRequest("http://localhost/api/v1/students", {
        headers: {
          authorization: "Bearer valid_bearer_token",
        },
      });

      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it("redirects unauthenticated browser navigation to /login with redirect param", async () => {
      (verifyEdgeSession as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/admin/users");
      const res = await middleware(req);

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/login");
      expect(location).toContain(`redirect=${encodeURIComponent("/admin/users")}`);
    });
  });
});
