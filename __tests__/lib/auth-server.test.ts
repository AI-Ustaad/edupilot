import { getSessionUser } from "@/lib/auth/auth-server";
import { cookies } from "next/headers";

jest.mock("next/headers");
jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifySessionCookie: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}));

describe("getSessionUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null if no session cookie", async () => {
    (cookies as jest.Mock).mockReturnValue({ get: () => undefined });
    const user = await getSessionUser();
    expect(user).toBeNull();
  });

  it("returns user with onboardingRequired true if no Firestore doc", async () => {
    const { adminAuth, adminDb } = require("@/lib/firebase-admin");

    (cookies as jest.Mock).mockReturnValue({ get: () => ({ value: "mock-session" }) });
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user123",
      email: "test@test.com",
    });
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      }),
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
      }),
    });

    const user = await getSessionUser();
    expect(user?.onboardingRequired).toBe(true);
  });

  it("returns user data when Firestore doc exists", async () => {
    const { adminAuth, adminDb } = require("@/lib/firebase-admin");

    (cookies as jest.Mock).mockReturnValue({ get: () => ({ value: "mock-session" }) });
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user456",
      email: "admin@school.com",
    });
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            role: "admin",
            tenantId: "tenant-123",
            email: "admin@school.com",
          }),
        }),
      }),
    });

    const user = await getSessionUser();
    expect(user?.uid).toBe("user456");
    expect(user?.role).toBe("admin");
    expect(user?.tenantId).toBe("tenant-123");
    expect(user?.onboardingRequired).toBe(false);
  });
});
