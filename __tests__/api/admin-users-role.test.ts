import { POST } from "@/app/api/v1/admin/users/role/route";
import { UserRepository } from "@/repositories/user.repository";
import { getSessionUser } from "@/lib/auth/auth-server";
import { adminAuth } from "@/lib/firebase-admin";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    setCustomUserClaims: jest.fn(),
  },
}));
jest.mock("@/repositories/user.repository");

describe("Admin Users Role API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/admin/users/role", {
      method: "POST",
      body: JSON.stringify({ uid: "user1", role: "teacher" }),
    });
    const res = await POST(req as any, {});
    expect(res.status).toBe(401);
  });

  it("POST returns 400 for invalid role", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });

    const req = new Request("http://localhost/api/v1/admin/users/role", {
      method: "POST",
      body: JSON.stringify({ uid: "user1", role: "superAdmin" }),
    });
    const res = await POST(req as any, { tenantId: "tenant123" });
    
    expect(res.status).toBe(400);
  });

  it("POST updates role successfully", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });

    (UserRepository.prototype.updateRole as jest.Mock).mockResolvedValue(undefined);
    (adminAuth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined);

    const req = new Request("http://localhost/api/v1/admin/users/role", {
      method: "POST",
      body: JSON.stringify({ uid: "user1", role: "teacher" }),
    });
    const res = await POST(req as any, { tenantId: "tenant123" });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(UserRepository.prototype.updateRole).toHaveBeenCalledWith("user1", "teacher", "tenant123");
  });
});
