import { POST } from "@/app/api/v1/ai/agents/route";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/lib/ai/providers/GeminiProvider", () => ({
  GeminiProvider: jest.fn().mockImplementation(() => ({
    name: "test",
    getConfig: () => ({ model: "test" }),
    generateContent: jest.fn().mockResolvedValue({ text: "AI response", tokensUsed: 10 }),
  })),
}));
jest.mock("@/lib/ai/monitoring/UsageTracker", () => ({
  UsageTracker: jest.fn().mockImplementation(() => ({
    track: jest.fn(),
  })),
}));

describe("AI Agents API - Authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/ai/agents", () => {
    it("returns 401 if no session", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue(null);
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1" });
      expect(res.status).toBe(401);
    });

    it("returns 400 if agentType is missing", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(400);
    });

    it("returns 400 if query is missing", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(400);
    });

    it("returns 400 for unknown agent type", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "nonexistent", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(400);
    });

    it("allows admin to use teacher agent (has ai.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(200);
    });

    it("allows admin to use finance agent (has finance.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "finance", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(200);
    });

    it("allows admin to use principal agent (has dashboard.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "principal", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(200);
    });

    it("allows admin to use hr agent (has staff.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "hr", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(200);
    });

    it("allows admin to use admission agent (has admissions)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "admin",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "admission", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "admin" } });
      expect(res.status).toBe(200);
    });

    it("blocks teacher from using finance agent (teacher lacks finance.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "teacher",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "finance", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "teacher" } });
      expect(res.status).toBe(403);
    });

    it("blocks teacher from using hr agent (teacher lacks staff.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "teacher",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "hr", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "teacher" } });
      expect(res.status).toBe(403);
    });

    it("blocks parent from using finance agent (parent lacks finance.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "parent",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "finance", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "parent" } });
      expect(res.status).toBe(403);
    });

    it("blocks accountant from using finance agent (accountant lacks finance.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "accountant",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "finance", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "accountant" } });
      expect(res.status).toBe(403);
    });

    it("blocks parent from using teacher agent (parent lacks ai.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "parent",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "parent" } });
      expect(res.status).toBe(403);
    });

    it("allows teacher to use teacher agent (teacher has ai.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "teacher",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "teacher", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "teacher" } });
      expect(res.status).toBe(200);
    });

    it("allows teacher to use principal agent (teacher has dashboard.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "teacher",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "principal", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "teacher" } });
      expect(res.status).toBe(200);
    });

    it("allows accountant to use principal agent (accountant has dashboard.view)", async () => {
      (getSessionUser as jest.Mock).mockResolvedValue({
        uid: "user-1",
        role: "accountant",
        tenantId: "tenant-1",
      });
      const req = new Request("http://localhost/api/v1/ai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentType: "principal", query: "test" }),
      });
      const res = await POST(req as any, { tenantId: "tenant-1", user: { uid: "user-1", role: "accountant" } });
      expect(res.status).toBe(200);
    });
  });
});
