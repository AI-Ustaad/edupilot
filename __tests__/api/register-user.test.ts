import { POST } from "@/app/api/v1/auth/register-user/route";
import { adminAuth } from "@/lib/firebase-admin";
import { UserRepository } from "@/repositories/user.repository";

jest.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    createUser: jest.fn(),
  },
}));

jest.mock("@/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn().mockResolvedValue("user123"),
  })),
}));

describe("Register User API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST registers user with default student role when no role provided", async () => {
    (adminAuth.createUser as jest.Mock).mockResolvedValue({ uid: "user123" });
    const createMock = jest.fn().mockResolvedValue("user123");
    (UserRepository as jest.Mock).mockImplementation(() => ({
      create: createMock,
    }));

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", password: "password123", name: "Test User" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createMock).toHaveBeenCalledWith({
      uid: "user123",
      email: "test@test.com",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST ignores client-provided role and defaults to student", async () => {
    (adminAuth.createUser as jest.Mock).mockResolvedValue({ uid: "user456" });
    const createMock = jest.fn().mockResolvedValue("user456");
    (UserRepository as jest.Mock).mockImplementation(() => ({
      create: createMock,
    }));

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "hacker@test.com", password: "password123", name: "Hacker", role: "admin" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createMock).toHaveBeenCalledWith({
      uid: "user456",
      email: "hacker@test.com",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST ignores superAdmin role attempt", async () => {
    (adminAuth.createUser as jest.Mock).mockResolvedValue({ uid: "user789" });
    const createMock = jest.fn().mockResolvedValue("user789");
    (UserRepository as jest.Mock).mockImplementation(() => ({
      create: createMock,
    }));

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "evil@test.com", password: "password123", name: "Evil", role: "superAdmin" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createMock).toHaveBeenCalledWith({
      uid: "user789",
      email: "evil@test.com",
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
    const createMock = jest.fn().mockResolvedValue("user999");
    (UserRepository as jest.Mock).mockImplementation(() => ({
      create: createMock,
    }));

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "tenant@test.com", password: "password123", name: "Tenant User", tenantId: "tenant_123" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createMock).toHaveBeenCalledWith({
      uid: "user999",
      email: "tenant@test.com",
      role: "student",
      tenantId: "tenant_123",
      createdAt: expect.any(Date),
    });
  });
});
