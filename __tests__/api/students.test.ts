import { NextRequest } from "next/server";
import { GET } from "@/app/api/students/route";
import { getSessionUser } from "@/lib/auth/auth-server";

// Mock dependencies
jest.mock("@/lib/auth/auth-server");
jest.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
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
    const req = new NextRequest("http://localhost/api/students");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("GET returns students array for authenticated user", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      tenantId: "school123",
      role: "admin",
    });
    const mockStudents = [{ id: "1", fullName: "Ali", classGrade: "Class 5", rollNumber: 10 }];
    const mockSnapshot = { docs: mockStudents.map((d) => ({ id: d.id, data: () => d })) };
    const { adminDb } = require("@/lib/firebase-admin");
    adminDb.collection.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSnapshot),
    });

    const req = new NextRequest("http://localhost/api/students");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toEqual(mockStudents);
  });
});
