import { GET } from "@/app/api/v1/auth/session/route";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");

describe("GET /api/v1/auth/session (B20)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/auth/session");
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it("returns the real client IP from x-forwarded-for for a signed-in user", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });
    const req = new Request("http://localhost/api/v1/auth/session", {
      headers: { "x-forwarded-for": "203.0.113.45, 198.51.100.1" },
    });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ip).toBe("203.0.113.45");
  });

  it("returns unknown, never 127.0.0.1, when no forwarding headers are present", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });
    const req = new Request("http://localhost/api/v1/auth/session");
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ip).toBe("unknown");
    expect(json.ip).not.toBe("127.0.0.1");
  });
});
