import { DELETE } from "@/app/api/v1/fees/[id]/route";
import { DELETE as deleteStudentDELETE } from "@/app/api/v1/admin/delete-student/route";
import { FeesService } from "@/services/fees.service";
import { StudentService } from "@/services/StudentService";
import { AttendanceService } from "@/services/attendance.service";
import { getSessionUser } from "@/lib/auth/auth-server";

jest.mock("@/lib/auth/auth-server");
jest.mock("@/services/fees.service");
jest.mock("@/services/StudentService");
jest.mock("@/services/attendance.service");
jest.mock("@/services/AuditService", () => ({
  AuditService: jest.fn().mockImplementation(() => ({
    log: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe("Fees Deletion Parameter Order Verification", () => {
  const tenantId = "school_tenant_999";
  const userId = "admin_user_456";
  const feeId = "fee_record_123";
  const studentId = "student_789";

  beforeEach(() => {
    jest.clearAllMocks();
    (getSessionUser as jest.Mock).mockResolvedValue({
      uid: userId,
      tenantId,
      role: "admin",
    });
  });

  it("DELETE /api/v1/fees/[id] invokes FeesService.deleteFee with (tenantId, id, userId)", async () => {
    const mockFee = {
      id: feeId,
      tenantId,
      studentName: "John Doe",
      amountPaid: 500,
    };
    (FeesService.prototype.getFeeById as jest.Mock).mockResolvedValue(mockFee);
    (FeesService.prototype.deleteFee as jest.Mock).mockResolvedValue(undefined);

    const req = new Request(`http://localhost/api/v1/fees/${feeId}`, {
      method: "DELETE",
    });

    const res = await DELETE(req as any, { tenantId, user: { uid: userId, tenantId, role: "admin" } } as any);
    expect(res.status).toBe(200);

    // CRITICAL: verify deleteFee was called with (tenantId, id, userId) and NOT (id, tenantId, userId)
    expect(FeesService.prototype.deleteFee).toHaveBeenCalledWith(tenantId, feeId, userId);
    expect(FeesService.prototype.deleteFee).not.toHaveBeenCalledWith(feeId, tenantId, userId);
  });

  it("DELETE /api/v1/admin/delete-student invokes FeesService.deleteFee with (tenantId, fee.id, userId)", async () => {
    (StudentService.prototype.getById as jest.Mock).mockResolvedValue({
      id: studentId,
      personal: { firstName: "Jane", lastName: "Smith" },
    });
    (StudentService.prototype.hardDelete as jest.Mock).mockResolvedValue(true);
    (AttendanceService.prototype.findByStudentId as jest.Mock).mockResolvedValue([]);

    const studentFees = [
      { id: "fee_001", tenantId, amountPaid: 100 },
      { id: "fee_002", tenantId, amountPaid: 200 },
    ];
    (FeesService.prototype.findByStudent as jest.Mock).mockResolvedValue(studentFees);
    (FeesService.prototype.deleteFee as jest.Mock).mockResolvedValue(undefined);

    const req = new Request(`http://localhost/api/v1/admin/delete-student?id=${studentId}`, {
      method: "DELETE",
    });

    const res = await deleteStudentDELETE(req as any, { tenantId, user: { uid: userId, tenantId, role: "admin" } } as any);
    expect(res.status).toBe(200);

    // CRITICAL: verify deleteFee was called with (tenantId, fee.id, userId) for each fee
    expect(FeesService.prototype.deleteFee).toHaveBeenCalledWith(tenantId, "fee_001", userId);
    expect(FeesService.prototype.deleteFee).toHaveBeenCalledWith(tenantId, "fee_002", userId);
    expect(FeesService.prototype.deleteFee).not.toHaveBeenCalledWith("fee_001", tenantId);
    expect(FeesService.prototype.deleteFee).not.toHaveBeenCalledWith("fee_002", tenantId);
  });
});
