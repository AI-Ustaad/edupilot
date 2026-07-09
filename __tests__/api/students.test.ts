import { GET } from "@/app/api/v1/students/route";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
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

    const req = new Request("http://localhost/api/v1/students?page=1&limit=20");
    const res = await GET(req as any, { user: { uid: "user123", tenantId: "school123", role: "admin" } } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toBeDefined();
  });
});
