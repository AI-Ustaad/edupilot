import { GET } from "@/app/api/v1/jobs/attendance-report/route";
import { TenantRepository } from "@/repositories/tenant.repository";
import { sendEmail } from "@/lib/email";

jest.mock("@/repositories/tenant.repository", () => ({
  TenantRepository: jest.fn().mockImplementation(() => ({
    listAll: jest.fn(),
  })),
}));

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn(),
}));

describe("Attendance Report Cron API", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("GET returns 500 if CRON_SECRET is not configured", async () => {
    const req = new Request("http://localhost/api/v1/jobs/attendance-report");
    const res = await GET(req as any);
    
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Server misconfiguration");
  });

  it("GET returns 401 if secret is missing", async () => {
    process.env.CRON_SECRET = "test-secret";
    const req = new Request("http://localhost/api/v1/jobs/attendance-report");
    const res = await GET(req as any);
    
    expect(res.status).toBe(401);
  });

  it("GET returns 401 for invalid secret", async () => {
    process.env.CRON_SECRET = "correct-secret";
    const req = new Request("http://localhost/api/v1/jobs/attendance-report?secret=wrong-secret");
    const res = await GET(req as any);
    
    expect(res.status).toBe(401);
  });

  it("GET returns 200 for valid secret via query param", async () => {
    process.env.CRON_SECRET = "correct-secret";
    
    const listAllMock = jest.fn().mockResolvedValue([{ id: "tenant1" }]);
    (TenantRepository as jest.Mock).mockImplementation(() => ({
      listAll: listAllMock,
    }));
    
    const { AttendanceService } = require("@/services/attendance.service");
    const mockListAttendance = jest.fn().mockResolvedValue([]);
    jest.spyOn(AttendanceService.prototype, "listAttendance").mockImplementation(mockListAttendance);

    const req = new Request("http://localhost/api/v1/jobs/attendance-report?secret=correct-secret");
    const res = await GET(req as any);
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("GET returns 200 for valid secret via Bearer token", async () => {
    process.env.CRON_SECRET = "correct-secret";
    
    const listAllMock = jest.fn().mockResolvedValue([{ id: "tenant1" }]);
    (TenantRepository as jest.Mock).mockImplementation(() => ({
      listAll: listAllMock,
    }));
    
    const { AttendanceService } = require("@/services/attendance.service");
    const mockListAttendance = jest.fn().mockResolvedValue([]);
    jest.spyOn(AttendanceService.prototype, "listAttendance").mockImplementation(mockListAttendance);

    const req = new Request("http://localhost/api/v1/jobs/attendance-report", {
      headers: { Authorization: "Bearer correct-secret" },
    });
    const res = await GET(req as any);
    
    expect(res.status).toBe(200);
  });
});
