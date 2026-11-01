import { StudentService } from "@/services/StudentService";
import { StudentRepository } from "@/repositories/student.repository";
import { SubscriptionLimitException } from "@/errors/AppError";

jest.mock("@/repositories/student.repository");

describe("StudentService.checkSubscriptionLimit (DEF-023)", () => {
  let studentRepo: jest.Mocked<StudentRepository>;
  let service: StudentService;
  const tenantId = "tenant_sub_check";

  beforeEach(() => {
    jest.clearAllMocks();
    studentRepo = new StudentRepository() as any;
    service = new StudentService(studentRepo);
  });

  it("permits adding students when within plan limits", async () => {
    studentRepo.count.mockResolvedValue(40);

    await expect(service.checkSubscriptionLimit(tenantId, 50, 5)).resolves.toBeUndefined();
    expect(studentRepo.count).toHaveBeenCalledWith(tenantId);
  });

  it("throws SubscriptionLimitException when adding exceeds plan limits", async () => {
    studentRepo.count.mockResolvedValue(48);

    await expect(service.checkSubscriptionLimit(tenantId, 50, 5)).rejects.toThrow(
      SubscriptionLimitException
    );
    await expect(service.checkSubscriptionLimit(tenantId, 50, 5)).rejects.toThrow(
      "Student limit reached (50). Current: 48, adding: 5. Please upgrade your plan."
    );
  });
});

