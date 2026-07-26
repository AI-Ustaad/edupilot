import { GET } from "@/app/api/v1/jobs/[jobId]/route";
import { JobRepository } from "@/repositories/job.repository";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/repositories/job.repository");

describe("Job Status API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET returns 401 if no session", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/jobs/job123");
    const res = await GET(req as any, { params: { jobId: "job123" } });
    expect(res.status).toBe(401);
  });

  it("GET returns 400 if jobId missing", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });

    const req = new Request("http://localhost/api/v1/jobs/");
    const res = await GET(req as any, { params: { jobId: "" } });
    expect(res.status).toBe(400);
  });

  it("GET returns 404 if job not found", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });

    (JobRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/v1/jobs/job123");
    const res = await GET(req as any, { tenantId: "tenant123", params: { jobId: "job123" } });
    
    expect(res.status).toBe(404);
  });

  it("GET returns job data when found", async () => {
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: "user123",
      tenantId: "tenant123",
      role: "admin",
    });

    const mockJob = { id: "job123", type: "report", status: "completed" as const, progress: 100, tenantId: "tenant123" };
    (JobRepository.prototype.findById as jest.Mock).mockResolvedValue(mockJob);

    const req = new Request("http://localhost/api/v1/jobs/job123");
    const res = await GET(req as any, { tenantId: "tenant123", params: { jobId: "job123" } });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.job).toEqual(mockJob);
  });
});
