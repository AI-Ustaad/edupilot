import { GET } from "@/app/api/v1/students/360/route";
import { getSessionUser } from "@/lib/auth/auth-server";
import { StudentService } from "@/services/StudentService";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/services/StudentService");

describe("GET /api/v1/students/360 Route Integration & Security", () => {
  const tenantId = "tenant-alpha";
  const studentId = "U4RdCxIHGZf8fSyhcb9e";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Security: Unauthenticated request returns 401", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);

    const req = new Request(`http://localhost/api/v1/students/360?id=${studentId}`);
    const res = await GET(req as any, {} as any);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("Security: Unauthorized role lacking students.view returns 403 via real withPermission boundary", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-accountant-1",
      tenantId,
      role: "accountant", // accountant lacks students.view in ROLE_PERMISSIONS
    });

    const req = new Request(`http://localhost/api/v1/students/360?id=${studentId}`);
    const res = await GET(req as any, {
      user: { uid: "user-accountant-1", tenantId, role: "accountant" },
      tenantId,
    } as any);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Forbidden");
  });

  test("Validation: Missing student ID returns 400", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-admin-1",
      tenantId,
      role: "admin",
    });

    const req = new Request("http://localhost/api/v1/students/360");
    const res = await GET(req as any, {
      user: { uid: "user-admin-1", tenantId, role: "admin" },
      tenantId,
    } as any);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Student ID required");
  });

  test("Validation: Blank student ID returns 400", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-admin-1",
      tenantId,
      role: "admin",
    });

    const req = new Request("http://localhost/api/v1/students/360?id=   ");
    const res = await GET(req as any, {
      user: { uid: "user-admin-1", tenantId, role: "admin" },
      tenantId,
    } as any);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Student ID required");
  });

  test("Not Found: Non-existent student returns 404", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-admin-1",
      tenantId,
      role: "admin",
    });

    const mockStudent360 = jest.fn().mockResolvedValue(null);
    (StudentService as jest.Mock).mockImplementation(() => ({
      student360: mockStudent360,
    }));

    const req = new Request(`http://localhost/api/v1/students/360?id=${studentId}`);
    const res = await GET(req as any, {
      user: { uid: "user-admin-1", tenantId, role: "admin" },
      tenantId,
    } as any);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Student not found");
    expect(mockStudent360).toHaveBeenCalledWith(tenantId, studentId);
  });

  test("Tenant Isolation: Cross-tenant student request returns 404 without leaking data", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-admin-tenant-a",
      tenantId: "tenant-a",
      role: "admin",
    });

    // StudentService returns null when student belongs to a different tenant
    const mockStudent360 = jest.fn().mockResolvedValue(null);
    (StudentService as jest.Mock).mockImplementation(() => ({
      student360: mockStudent360,
    }));

    const req = new Request(`http://localhost/api/v1/students/360?id=${studentId}`);
    const res = await GET(req as any, {
      user: { uid: "user-admin-tenant-a", tenantId: "tenant-a", role: "admin" },
      tenantId: "tenant-a",
    } as any);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeNull();
    expect(mockStudent360).toHaveBeenCalledWith("tenant-a", studentId);
  });

  test("Success: Authorized user + Valid student + Same tenant returns 200 with full aggregate", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-admin-1",
      tenantId,
      role: "admin",
    });

    const mockAggregate = {
      student: {
        id: studentId,
        studentId,
        fullName: "Fatima Ali",
        classGrade: "10",
        section: "A",
        tenantId,
      },
      attendance: { present: 20, absent: 2, late: 1, percentage: 91, records: [] },
      fees: { totalDue: 5000, totalPaid: 5000, outstanding: 0, records: [] },
      marks: { exams: [], average: 85, trend: "stable", records: [] },
      behavior: { logs: [], incidents: 0 },
      transport: null,
      hostel: null,
      timeline: [{ date: "2026-01-15", type: "admission", title: "Admitted", description: "Enrolled" }],
      aiSummary: "",
    };

    const mockStudent360 = jest.fn().mockResolvedValue(mockAggregate);
    (StudentService as jest.Mock).mockImplementation(() => ({
      student360: mockStudent360,
    }));

    const req = new Request(`http://localhost/api/v1/students/360?id=${studentId}`);
    const res = await GET(req as any, {
      user: { uid: "user-admin-1", tenantId, role: "admin" },
      tenantId,
    } as any);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.student.id).toBe(studentId);
    expect(body.data.student.fullName).toBe("Fatima Ali");
    expect(body.data.attendance.percentage).toBe(91);
  });

  test("Resilience: Endpoint returns 200 when optional related data is empty or degraded", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user-teacher-1",
      tenantId,
      role: "teacher",
    });

    const degradedAggregate = {
      student: {
        id: studentId,
        studentId,
        fullName: "Zain Ahmed",
        classGrade: "9",
        section: "B",
        tenantId,
      },
      attendance: { present: 0, absent: 0, late: 0, percentage: 0, records: [] },
      fees: { totalDue: 0, totalPaid: 0, outstanding: 0, records: [] },
      marks: { exams: [], average: 0, trend: "stable", records: [] },
      behavior: { logs: [], incidents: 0 },
      transport: null,
      hostel: null,
      timeline: [],
      aiSummary: "",
    };

    const mockStudent360 = jest.fn().mockResolvedValue(degradedAggregate);
    (StudentService as jest.Mock).mockImplementation(() => ({
      student360: mockStudent360,
    }));

    const req = new Request(`http://localhost/api/v1/students/360?id=${studentId}`);
    const res = await GET(req as any, {
      user: { uid: "user-teacher-1", tenantId, role: "teacher" },
      tenantId,
    } as any);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.student.fullName).toBe("Zain Ahmed");
  });
});
