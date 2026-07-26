import { POST } from "@/app/api/v1/education/rules/route";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/education/engines/education-rules.engine", () => ({
  educationRulesEngine: {
    getCountries: jest.fn().mockReturnValue(["USA", "Canada"]),
    getProvinces: jest.fn().mockReturnValue(["Province 1", "Province 2"]),
    getAuthorities: jest.fn().mockReturnValue(["Authority 1"]),
    getSystems: jest.fn().mockReturnValue(["System 1"]),
    getVersions: jest.fn().mockReturnValue(["Version 1"]),
    getLevels: jest.fn().mockReturnValue(["Level 1"]),
    generateAcademicStructure: jest.fn().mockReturnValue({ classes: [] }),
  },
}));

describe("Education Rules API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/education/rules", {
      method: "POST",
      body: JSON.stringify({ action: "GET_COUNTRIES" }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("POST returns 200 for GET_COUNTRIES", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "school123",
      role: "admin",
    });

    const req = new Request("http://localhost/api/v1/education/rules", {
      method: "POST",
      body: JSON.stringify({ action: "GET_COUNTRIES" }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual(["USA", "Canada"]);
  });

  it("POST returns 400 for invalid action", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "school123",
      role: "admin",
    });

    const req = new Request("http://localhost/api/v1/education/rules", {
      method: "POST",
      body: JSON.stringify({ action: "INVALID_ACTION" }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});
