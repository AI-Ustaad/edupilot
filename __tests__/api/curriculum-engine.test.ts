import { POST } from "@/app/api/v1/curriculum/engine/route";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/services/curriculum-engine.service", () => ({
  curriculumEngine: {
    generateAcademicStructure: jest.fn(),
  },
}));

describe("Curriculum Engine API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/curriculum/engine", {
      method: "POST",
      body: JSON.stringify({ schoolId: "school123" }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("POST returns 200 for authenticated user", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "school123",
      role: "admin",
    });

    const { curriculumEngine } = require("@/services/curriculum-engine.service");
    (curriculumEngine.generateAcademicStructure as jest.Mock).mockResolvedValue({
      classes: [{ id: "1", name: "Class 1" }],
    });

    const req = new Request("http://localhost/api/v1/curriculum/engine", {
      method: "POST",
      body: JSON.stringify({ schoolId: "school123" }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
  });
});
