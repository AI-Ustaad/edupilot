import { GET } from "@/app/api/v1/admin/users/route";
import { UserRepository } from "@/repositories/user.repository";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/repositories/user.repository");

describe("Admin Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/admin/users");
    const res = await GET(req as any, {});
    expect(res.status).toBe(401);
  });

  it("GET returns users for tenant", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });

    const mockUsers = [
      { uid: "1", email: "a@test.com", role: "teacher", tenantId: "tenant123" },
      { uid: "2", email: "b@test.com", role: "student", tenantId: "tenant123" },
    ];
    (UserRepository.prototype.findAllByTenant as jest.Mock).mockResolvedValue(mockUsers);

    const req = new Request("http://localhost/api/v1/admin/users");
    const res = await GET(req as any, { tenantId: "tenant123" });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockUsers);
  });
});
