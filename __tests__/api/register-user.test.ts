import { Request } from "node-fetch";

describe("Register User API", () => {
  const loadRoute = () => {
    jest.resetModules();

    jest.doMock("@/lib/firebase-admin", () => ({
      adminAuth: {
        createUser: jest.fn(),
        setCustomUserClaims: jest.fn(),
      },
    }));

    const createUserMock = jest.fn();
    jest.doMock("@/services/auth.service", () => ({
      AuthService: jest.fn(function () {
        this.createUser = createUserMock;
        return this;
      }),
    }));

    const createMock = jest.fn().mockResolvedValue("user123");
    jest.doMock("@/repositories/user.repository", () => ({
      UserRepository: jest.fn(function () {
        this.create = createMock;
        return this;
      }),
    }));

    return { POST: require("@/app/api/v1/auth/register-user/route").POST, createUserMock, createMock };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST registers user with default student role when no role provided", async () => {
    const { POST, createUserMock, createMock } = loadRoute();
    createUserMock.mockResolvedValue({ uid: "user123" });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com", password: "password123", name: "Test User" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createUserMock).toHaveBeenCalledWith("test@test.com", "password123", { displayName: "Test User" });
    expect(createMock).toHaveBeenCalledWith({
      uid: "user123",
      email: "test@test.com",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST ignores client-provided role and defaults to student", async () => {
    const { POST, createUserMock, createMock } = loadRoute();
    createUserMock.mockResolvedValue({ uid: "user456" });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "hacker@test.com", password: "password123", name: "Hacker", role: "admin" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createUserMock).toHaveBeenCalledWith("hacker@test.com", "password123", { displayName: "Hacker" });
    expect(createMock).toHaveBeenCalledWith({
      uid: "user456",
      email: "hacker@test.com",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST ignores superAdmin role attempt", async () => {
    const { POST, createUserMock, createMock } = loadRoute();
    createUserMock.mockResolvedValue({ uid: "user789" });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "evil@test.com", password: "password123", name: "Evil", role: "superAdmin" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createUserMock).toHaveBeenCalledWith("evil@test.com", "password123", { displayName: "Evil" });
    expect(createMock).toHaveBeenCalledWith({
      uid: "user789",
      email: "evil@test.com",
      role: "student",
      tenantId: null,
      createdAt: expect.any(Date),
    });
  });

  it("POST returns 400 for missing required fields", async () => {
    const { POST } = loadRoute();

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
    const { POST, createUserMock } = loadRoute();
    createUserMock.mockRejectedValue(new Error("Email already exists"));

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
    const { POST, createUserMock, createMock } = loadRoute();
    createUserMock.mockResolvedValue({ uid: "user999" });

    const req = new Request("http://localhost/api/v1/auth/register-user", {
      method: "POST",
      body: JSON.stringify({ email: "tenant@test.com", password: "password123", name: "Tenant User", tenantId: "tenant_123" }),
    });
    const res = await POST(req as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(createUserMock).toHaveBeenCalledWith("tenant@test.com", "password123", { displayName: "Tenant User" });
    expect(createMock).toHaveBeenCalledWith({
      uid: "user999",
      email: "tenant@test.com",
      role: "student",
      tenantId: "tenant_123",
      createdAt: expect.any(Date),
    });
  });
});
