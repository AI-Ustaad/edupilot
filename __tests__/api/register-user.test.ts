import { POST } from "@/app/api/v1/auth/register-user/route";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    createUser: jest.fn(),
  },
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        set: jest.fn(),
      }),
    }),
  },
}));

describe("Register User API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST registers user with default student role when no role provided", async () => {
    (adminAuth.createUser as jest.Mock).mockResolvedValue({ uid: "user123" });
    const setMock = jest.fn();
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ set: setMock }),
    });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", password: "password123", name: "Test User" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(setMock).toHaveBeenCalledWith({
      email: "test@test.com",
      name: "Test User",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST ignores client-provided role and defaults to student", async () => {
    (adminAuth.createUser as jest.Mock).mockResolvedValue({ uid: "user456" });
    const setMock = jest.fn();
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ set: setMock }),
    });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "hacker@test.com", password: "password123", name: "Hacker", role: "admin" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(setMock).toHaveBeenCalledWith({
      email: "hacker@test.com",
      name: "Hacker",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST ignores superAdmin role attempt", async () => {
    (adminAuth.createUser as jest.Mock).mockResolvedValue({ uid: "user789" });
    const setMock = jest.fn();
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ set: setMock }),
    });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "evil@test.com", password: "password123", name: "Evil", role: "superAdmin" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(setMock).toHaveBeenCalledWith({
      email: "evil@test.com",
      name: "Evil",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST returns 400 for missing required fields", async () => {
    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toContain("Missing required fields");
  });

  it("POST returns 400 when Firebase createUser fails", async () => {
    (adminAuth.createUser as jest.Mock).mockRejectedValue(new Error("Email already exists"));

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "existing@test.com", password: "password123", name: "Existing" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Email already exists");
  });

  it("POST accepts tenantId when provided", async () => {
    (adminAuth.createUser as jest.Mock).mockResolvedValue({ uid: "user999" });
    const setMock = jest.fn();
    (adminDb.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({ set: setMock }),
    });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "tenant@test.com", password: "password123", name: "Tenant User", tenantId: "tenant_123" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(setMock).toHaveBeenCalledWith({
      email: "tenant@test.com",
      name: "Tenant User",
      role: "student",
      tenantId: "tenant_123",
      createdAt: expect.any(Date),
    });
  });
});
