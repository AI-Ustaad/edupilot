// __tests__/api/parent-login.test.ts
//
// P0-01 SECURITY REGRESSION TEST
//
// Verifies that POST /api/v1/auth/parent-login cannot be used to
// authenticate as a parent merely by presenting a known email address
// (or any other insufficient credential). The only path that MUST yield
// a session cookie is a request that presents an ID token whose
// signature has been cryptographically verified by Firebase Auth via
// adminAuth.verifyIdToken (which itself is only issued after a
// successful client-side signInWithEmailAndPassword call).
//
// Each test loads the route with `jest.resetModules()` and replaces
// AuthService / SessionService with deterministic mocks, mirroring the
// pattern used by `register-user.test.ts`. The mocks are configured
// per-test so that we exercise the route's own authorization logic
// (role gate, error mapping, rate-limit gate) without depending on a
// live Firebase project.

interface AuthServiceMock {
  processLogin: jest.Mock;
}

interface SessionServiceMock {
  createCookie: jest.Mock;
}

interface RateLimitResult { success: boolean; reset: number }
interface RateLimitMock { checkAuthRateLimit: jest.Mock<Promise<RateLimitResult>, []> }

function loadRoute(opts: {
  processLoginImpl?: AuthServiceMock["processLogin"];
  createCookieImpl?: SessionServiceMock["createCookie"];
  rateLimitResult?: RateLimitResult;
} = {}) {
  jest.resetModules();

  const processLogin = opts.processLoginImpl ?? jest.fn();
  const createCookie = opts.createCookieImpl ?? jest.fn().mockResolvedValue("mock-session-cookie");
  const rateLimitResult = opts.rateLimitResult ?? { success: true, reset: 0 };

  const authServiceMock: AuthServiceMock = { processLogin };
  const sessionServiceMock: SessionServiceMock = { createCookie };

  const rateLimitMock: RateLimitMock = {
    checkAuthRateLimit: jest.fn().mockResolvedValue(rateLimitResult),
  };

  jest.doMock("@/services/auth.service", () => ({
    AuthService: jest.fn(function () {
      this.processLogin = processLogin;
      return this;
    }),
  }));

  jest.doMock("@/services/session.service", () => ({
    SessionService: jest.fn(function () {
      this.createCookie = createCookie;
      return this;
    }),
  }));

  jest.doMock("@/lib/ratelimit", () => rateLimitMock);

  const { POST } = require("@/app/api/v1/auth/parent-login/route");

  return { POST, processLogin, createCookie, rateLimitMock };
}

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/v1/auth/parent-login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const PARENT_USER = {
  uid: "parent-uid-1",
  email: "parent@example.com",
  role: "parent",
  tenantId: "tenant-parent-1",
  onboardingRequired: false,
};

function makeParentLoginResponse(overrides: Partial<typeof PARENT_USER> = {}) {
  return {
    success: true,
    message: "Authentication successful",
    user: { ...PARENT_USER, ...overrides },
    redirectTo: "/parent/dashboard",
  };
}

describe("P0-01 — /api/v1/auth/parent-login password-verification guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------
  // A. Valid parent email + correct password
  //    (modelled: client successfully signed in and presented a
  //     cryptographically-verified ID token for a parent user)
  // -----------------------------------------------------------------
  it("A. issues a session cookie when a verified parent ID token is presented", async () => {
    const { POST, processLogin, createCookie } = loadRoute({
      processLoginImpl: jest.fn().mockResolvedValue(makeParentLoginResponse()),
      createCookieImpl: jest.fn().mockResolvedValue("session-cookie-A"),
    });

    const res = await POST(makeReq({ idToken: "valid-parent-id-token" }) as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user.role).toBe("parent");
    expect(json.user.tenantId).toBe("tenant-parent-1");
    expect(createCookie).toHaveBeenCalledTimes(1);
    expect(createCookie).toHaveBeenCalledWith("valid-parent-id-token");
    // Cookie must be set on the response
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toMatch(/session=session-cookie-A/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(processLogin).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------
  // B. Valid parent email + WRONG password
  //    (modelled: token verification fails because the underlying
  //     credential was wrong, so processLogin throws InvalidTokenError)
  // -----------------------------------------------------------------
  it("B. rejects an unverified / wrong-credential token with 401 and no session", async () => {
    const { POST, processLogin, createCookie } = loadRoute({
      // Firebase Auth would never return a valid ID token for a wrong
      // password; the server-side equivalent is a verifyIdToken failure.
      // We model that as processLogin throwing InvalidTokenError, which is
      // exactly what the real AuthService does (see auth.service.ts:82-85).
      processLoginImpl: jest.fn().mockRejectedValue(
        Object.assign(new Error("Token verification failed."), { name: "InvalidTokenError" })
      ),
    });

    const res = await POST(makeReq({ idToken: "forged-or-wrong-password-token" }) as any);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    // The error message MUST NOT distinguish between "user not found" and
    // "wrong password" — that is the canonical anti-enumeration response.
    expect(json.error).toBe("Invalid credentials");
    expect(createCookie).not.toHaveBeenCalled();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeNull();
  });

  // -----------------------------------------------------------------
  // C. Non-existent email
  //    (Firebase would refuse to issue an ID token for an unknown email;
  //     server-side, the token simply does not verify)
  // -----------------------------------------------------------------
  it("C. rejects a token for a non-existent user with 401 and no session", async () => {
    const { POST, processLogin, createCookie } = loadRoute({
      processLoginImpl: jest.fn().mockRejectedValue(
        Object.assign(new Error("Token verification failed."), { name: "InvalidTokenError" })
      ),
    });

    const res = await POST(makeReq({ idToken: "unknown-user-id-token" }) as any);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Invalid credentials");
    expect(createCookie).not.toHaveBeenCalled();
    expect(processLogin).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------
  // D. Existing non-parent user authenticates via parent-login
  // -----------------------------------------------------------------
  it("D. rejects a verified non-parent token at the role gate (403)", async () => {
    const teacherLoginResponse = {
      success: true,
      message: "Authentication successful",
      user: {
        uid: "teacher-uid-1",
        email: "teacher@example.com",
        role: "teacher",
        tenantId: "tenant-1",
        onboardingRequired: false,
      },
      redirectTo: "/dashboard",
    };
    const { POST, processLogin, createCookie } = loadRoute({
      processLoginImpl: jest.fn().mockResolvedValue(teacherLoginResponse),
    });

    const res = await POST(makeReq({ idToken: "verified-teacher-token" }) as any);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Unauthorized: Parent access only");
    // The session cookie MUST NOT be issued for a non-parent — the role
    // gate is a hard authorization boundary, not a soft preference.
    expect(createCookie).not.toHaveBeenCalled();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeNull();
    // processLogin IS called (we need the verified user to know the
    // role), but the result is rejected without escalating privilege.
    expect(processLogin).toHaveBeenCalledTimes(1);
  });

  it("D2. rejects a verified admin token at the role gate (403)", async () => {
    const adminLoginResponse = {
      success: true,
      message: "Authentication successful",
      user: {
        uid: "admin-uid-1",
        email: "admin@example.com",
        role: "admin",
        tenantId: "tenant-1",
        onboardingRequired: false,
      },
      redirectTo: "/dashboard",
    };
    const { POST, processLogin, createCookie } = loadRoute({
      processLoginImpl: jest.fn().mockResolvedValue(adminLoginResponse),
    });

    const res = await POST(makeReq({ idToken: "verified-admin-token" }) as any);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBe("Unauthorized: Parent access only");
    expect(createCookie).not.toHaveBeenCalled();
  });

  it("D3. rejects a verified superAdmin token at the role gate (403)", async () => {
    const superAdminLoginResponse = {
      success: true,
      message: "Authentication successful",
      user: {
        uid: "super-uid-1",
        email: "super@example.com",
        role: "superAdmin",
        tenantId: null,
        onboardingRequired: false,
      },
      redirectTo: "/super-admin",
    };
    const { POST, processLogin, createCookie } = loadRoute({
      processLoginImpl: jest.fn().mockResolvedValue(superAdminLoginResponse),
    });

    const res = await POST(makeReq({ idToken: "verified-superadmin-token" }) as any);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toBe("Unauthorized: Parent access only");
    expect(createCookie).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  // E. Empty / missing password — but the route no longer accepts
  //    passwords at all; an empty idToken (or one absent) MUST be
  //    rejected.
  // -----------------------------------------------------------------
  it("E. rejects a missing idToken with 401", async () => {
    const { POST, processLogin, createCookie } = loadRoute();

    const res = await POST(makeReq({}) as any);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Invalid credentials");
    expect(processLogin).not.toHaveBeenCalled();
    expect(createCookie).not.toHaveBeenCalled();
  });

  it("E2. rejects an empty-string idToken with 401", async () => {
    const { POST, processLogin, createCookie } = loadRoute();

    const res = await POST(makeReq({ idToken: "" }) as any);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Invalid credentials");
    expect(processLogin).not.toHaveBeenCalled();
    expect(createCookie).not.toHaveBeenCalled();
  });

  it("E3. rejects a non-string idToken with 401", async () => {
    const { POST, processLogin, createCookie } = loadRoute();

    const res = await POST(makeReq({ idToken: 12345 }) as any);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(processLogin).not.toHaveBeenCalled();
    expect(createCookie).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  // F. Empty / missing email
  //    (the route no longer accepts email; an empty body MUST be
  //     rejected as missing idToken)
  // -----------------------------------------------------------------
  it("F. rejects an empty body as missing idToken (401)", async () => {
    const { POST, processLogin, createCookie } = loadRoute();

    const res = await POST(makeReq({ email: "parent@example.com" }) as any);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Invalid credentials");
    expect(processLogin).not.toHaveBeenCalled();
    expect(createCookie).not.toHaveBeenCalled();
  });

  it("F2. rejects a body with only a raw password (no idToken) with 401", async () => {
    const { POST, processLogin, createCookie } = loadRoute();

    // The OLD vulnerable contract accepted { email, password }. The fix
    // removes password handling entirely. A request that still uses the
    // old contract MUST NOT receive a session.
    const res = await POST(
      makeReq({ email: "parent@example.com", password: "anything" }) as any
    );
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe("Invalid credentials");
    expect(processLogin).not.toHaveBeenCalled();
    expect(createCookie).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  // G. Returned credential cannot be generated without a verified
  //    ID token. Equivalently: createCookie is invoked ONLY when
  //    processLogin has resolved AND the user is a parent.
  // -----------------------------------------------------------------
  it("G. does NOT create a session when processLogin throws", async () => {
    const { POST, processLogin, createCookie } = loadRoute({
      processLoginImpl: jest.fn().mockRejectedValue(new Error("any failure")),
    });

    await POST(makeReq({ idToken: "anything" }) as any);

    expect(processLogin).toHaveBeenCalledTimes(1);
    expect(createCookie).not.toHaveBeenCalled();
  });

  it("G2. does NOT create a session when role gate rejects", async () => {
    const { POST, processLogin, createCookie } = loadRoute({
      processLoginImpl: jest.fn().mockResolvedValue({
        success: true,
        message: "x",
        user: { ...PARENT_USER, role: "teacher" },
        redirectTo: "/dashboard",
      }),
    });

    await POST(makeReq({ idToken: "verified-teacher-token" }) as any);

    expect(processLogin).toHaveBeenCalledTimes(1);
    expect(createCookie).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------
  // H. tenantId and role claims remain correct after success
  // -----------------------------------------------------------------
  it("H. preserves tenantId and role from the verified token in the success response", async () => {
    const { POST } = loadRoute({
      processLoginImpl: jest.fn().mockResolvedValue(
        makeParentLoginResponse({ tenantId: "tenant-XYZ", role: "parent" })
      ),
    });

    const res = await POST(makeReq({ idToken: "valid-token" }) as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.user.role).toBe("parent");
    expect(json.user.tenantId).toBe("tenant-XYZ");
    // The response MUST NOT contain any privileged non-parent role even
    // if the Firestore doc were ever poisoned — the route reads from
    // the verified SessionUser shape, not from a client-supplied value.
    expect(json.user).not.toMatchObject({ role: "superAdmin" });
    expect(json.user).not.toMatchObject({ role: "admin" });
  });

  // -----------------------------------------------------------------
  // I. Existing /api/v1/auth/login (standard flow) is NOT affected
  //    — verified by the fact that this test suite touches ONLY
  //    /api/v1/auth/parent-login and never imports the login route.
  //    We add an explicit assertion to catch accidental cross-imports.
  // -----------------------------------------------------------------
  it("I. does NOT import the standard /api/v1/auth/login route", () => {
    // The fix is implemented as a local re-implementation of the
    // post-token-verification steps. The standard login route module
    // must not be a transitive dependency of the parent-login module.
    const fs = require("fs");
    const path = require("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../../app/api/v1/auth/parent-login/route.ts"),
      "utf8"
    );
    expect(src).not.toMatch(/from\s+["']@\/app\/api\/v1\/auth\/login/);
    expect(src).not.toMatch(/require\(.@\/app\/api\/v1\/auth\/login/);
  });

  // -----------------------------------------------------------------
  // Rate-limit gate
  // -----------------------------------------------------------------
  it("returns 429 when the rate limiter rejects the request", async () => {
    const { POST, processLogin, createCookie } = loadRoute({
      rateLimitResult: { success: false, reset: Date.now() + 60_000 },
    });

    const res = await POST(makeReq({ idToken: "anything" }) as any);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.success).toBe(false);
    expect(processLogin).not.toHaveBeenCalled();
    expect(createCookie).not.toHaveBeenCalled();
  });
});
