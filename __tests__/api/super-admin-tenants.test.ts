import { GET } from "@/app/api/v1/super-admin/tenants/route";
import { TenantRepository } from "@/repositories/tenant.repository";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/repositories/tenant.repository");

describe("Super Admin Tenants API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 401 if unauthenticated", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/super-admin/tenants");
    const res = await GET(req as any, {});
    expect(res.status).toBe(401);
  });

  it("GET returns 403 if role is not superAdmin", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-1",
      role: "admin",
      tenantId: "tenant-1",
    });
    const req = new Request("http://localhost/api/v1/super-admin/tenants");
    const res = await GET(req as any, {});
    expect(res.status).toBe(403);
  });

  it("GET returns tenants list for superAdmin", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "super-1",
      role: "superAdmin",
    });

    const mockTenants = [
      { id: "tenant-1", name: "School 1", status: "active" },
      { id: "tenant-2", name: "School 2", status: "trialing" },
    ];
    (TenantRepository.prototype.listAll as jest.Mock).mockResolvedValue(mockTenants);

    const req = new Request("http://localhost/api/v1/super-admin/tenants");
    const res = await GET(req as any, {});
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockTenants);
  });
});

