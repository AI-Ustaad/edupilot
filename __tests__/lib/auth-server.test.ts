import { getSessionUser } from "@/lib/auth/auth-server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

jest.mock("next/headers");
jest.mock("@/lib/firebase-admin");

describe("getSessionUser", () => {
  it("returns null if no session cookie", async () => {
    (cookies as jest.Mock).mockReturnValue({ get: () => undefined });
    const user = await getSessionUser();
    expect(user).toBeNull();
  });

  it("returns user with onboardingRequired true if no Firestore doc", async () => {
    (cookies as jest.Mock).mockReturnValue({ get: () => ({ value: "mock-session" }) });
    (adminAuth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user123",
      email: "test@test.com",
    });
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
      }),
    });
    const user = await getSessionUser();
    expect(user?.onboardingRequired).toBe(true);
  });
});
