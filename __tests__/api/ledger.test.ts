import { GET } from "@/app/api/v1/ledger/route";
import { LedgerRepository } from "@/repositories/ledger.repository";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/repositories/ledger.repository");

describe("Ledger API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/ledger");
    const res = await GET(req as any, {});
    expect(res.status).toBe(401);
  });

  it("GET returns ledger entries for tenant", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });

    const mockEntries = [
      { id: "1", type: "income", description: "Fee", amount: 1000, tenantId: "tenant123" },
    ];
    (LedgerRepository.prototype.findByTenant as jest.Mock).mockResolvedValue(mockEntries);

    const req = new Request("http://localhost/api/v1/ledger");
    const res = await GET(req as any, { tenantId: "tenant123" });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockEntries);
  });
});
