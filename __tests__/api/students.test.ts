import { GET, POST } from "@/app/api/v1/students/route";
import { getSessionUser } from "@/lib/auth/auth-server";
import { SubscriptionService } from "@/services/subscription.service";
import { StudentService } from "@/services/StudentService";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/services/subscription.service");
jest.mock("@/services/StudentService");
jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
      }),
      get: jest.fn().mockResolvedValue({ docs: [] }),
    }),
  },
}));

describe("Students API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/students");
    const res = await GET(req as any, {} as any);
    expect(res.status).toBe(401);
  });

  it("GET returns paginated students for authenticated user", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "school123",
      role: "admin",
    });

    const { adminDb } = require("@/lib/firebase-admin");
    const mockStudents = [
      { id: "1", fullName: "Ali", classGrade: "Class 5", rollNumber: 10 },
      { id: "2", fullName: "Bob", classGrade: "Class 5", rollNumber: 11 },
    ];
    const mockSnapshot = {
      docs: mockStudents.map((d) => ({ id: d.id, data: () => d })),
    };
    const mockCountSnap = { data: () => ({ count: 2 }) };

    adminDb.collection.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockCountSnap),
      }),
      get: jest.fn().mockResolvedValue(mockSnapshot),
    });

    (StudentService.prototype.paginate as jest.Mock).mockResolvedValue({
      data: mockStudents,
      total: 2,
      page: 1,
      totalPages: 1,
    });

    const req = new Request("http://localhost/api/v1/students?page=1&limit=20");
    const res = await GET(req as any, { user: { uid: "user123", tenantId: "school123", role: "admin" } } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toBeDefined();
  });

  it("POST returns 403 when subscription quota for students is exceeded", async () => {
    const { SubscriptionLimitException } = require("@/errors/AppError");

    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "admin1",
      tenantId: "school123",
      role: "admin",
    });

    (SubscriptionService.prototype.getPlanLimits as jest.Mock).mockResolvedValue({
      maxStudents: 50,
      maxStaff: 10,
    });

    (StudentService.prototype.checkSubscriptionLimit as jest.Mock).mockRejectedValue(
      new SubscriptionLimitException("Student limit reached (50). Please upgrade your plan.")
    );

    const body = {
      fullName: "Zayd Khan",
      classGrade: "Class 1",
    };

    const req = new Request("http://localhost/api/v1/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any, { user: { uid: "admin1", tenantId: "school123", role: "admin" } } as any);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("SUBSCRIPTION_LIMIT");
  });

  it("POST returns 201 when student is admitted within quota", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "admin1",
      tenantId: "school123",
      role: "admin",
    });

    (SubscriptionService.prototype.getPlanLimits as jest.Mock).mockResolvedValue({
      maxStudents: 500,
      maxStaff: 50,
    });

    (StudentService.prototype.checkSubscriptionLimit as jest.Mock).mockResolvedValue(undefined);
    (StudentService.prototype.create as jest.Mock).mockResolvedValue({
      id: "std_new_123",
      fullName: "Ayesha Malik",
      classGrade: "Class 2",
    });

    const body = {
      fullName: "Ayesha Malik",
      classGrade: "Class 2",
    };

    const req = new Request("http://localhost/api/v1/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any, { user: { uid: "admin1", tenantId: "school123", role: "admin" } } as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("std_new_123");
  });
});
