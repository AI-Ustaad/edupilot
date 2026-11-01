import { FeeReminderService } from "@/services/fee-reminder.service";
import { sendEmail } from "@/lib/email";

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

describe("FeeReminderService (DEF-012)", () => {
  let mockFeesRepo: any;
  let mockStudentRepo: any;
  let mockTenantRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTenantRepo = {
      listAll: jest.fn().mockResolvedValue([{ id: "tenant-1" }]),
    };
    mockStudentRepo = {
      findById: jest.fn().mockResolvedValue({
        id: "student-1",
        fullName: "Ali Ahmed",
        parentEmail: "parent@example.com",
      }),
    };
  });

  it("calculates dueAmount reliably from totalAmount and paidAmount instead of sending Rs. 0", async () => {
    mockFeesRepo = {
      findWithFilters: jest.fn().mockResolvedValue([
        {
          id: "fee-1",
          studentId: "student-1",
          feeMonth: "October 2026",
          dueDate: "2026-10-10",
          status: "overdue",
          totalAmount: 15000,
          paidAmount: 0,
          amountPaid: 0,
        },
      ]),
    };

    const service = new FeeReminderService(mockFeesRepo, mockStudentRepo, mockTenantRepo);
    const result = await service.sendReminders();

    expect(result.processed).toBe(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const emailHtml = (sendEmail as jest.Mock).mock.calls[0][2];
    expect(emailHtml).toContain("Rs. 15000");
    expect(emailHtml).not.toContain("Rs. 0");
  });

  it("handles partial payments correctly (e.g., total 10000, paid 4000, due 6000)", async () => {
    mockFeesRepo = {
      findWithFilters: jest.fn().mockResolvedValue([
        {
          id: "fee-2",
          studentId: "student-1",
          feeMonth: "November 2026",
          dueDate: "2026-11-10",
          status: "pending",
          totalAmount: 10000,
          paidAmount: 4000,
          discount: 1000,
        },
      ]),
    };

    const service = new FeeReminderService(mockFeesRepo, mockStudentRepo, mockTenantRepo);
    const result = await service.sendReminders();

    expect(result.processed).toBe(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const emailHtml = (sendEmail as jest.Mock).mock.calls[0][2];
    expect(emailHtml).toContain("Rs. 5000");
  });

  it("falls back to feeData.amount if totalAmount is missing", async () => {
    mockFeesRepo = {
      findWithFilters: jest.fn().mockResolvedValue([
        {
          id: "fee-3",
          studentId: "student-1",
          feeMonth: "December 2026",
          dueDate: "2026-12-10",
          amount: 8500,
          amountPaid: 0,
          status: "unpaid",
        },
      ]),
    };

    const service = new FeeReminderService(mockFeesRepo, mockStudentRepo, mockTenantRepo);
    const result = await service.sendReminders();

    expect(result.processed).toBe(1);
    const emailHtml = (sendEmail as jest.Mock).mock.calls[0][2];
    expect(emailHtml).toContain("Rs. 8500");
  });

  it("skips reminder if outstanding balance is 0 or less", async () => {
    mockFeesRepo = {
      findWithFilters: jest.fn().mockResolvedValue([
        {
          id: "fee-4",
          studentId: "student-1",
          feeMonth: "January 2027",
          dueDate: "2027-01-10",
          totalAmount: 5000,
          paidAmount: 5000,
          status: "unpaid",
        },
      ]),
    };

    const service = new FeeReminderService(mockFeesRepo, mockStudentRepo, mockTenantRepo);
    const result = await service.sendReminders();

    expect(result.processed).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

