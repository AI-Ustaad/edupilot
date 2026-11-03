import { SubscriptionService } from "@/services/subscription.service";
import { StudentService } from "@/services/StudentService";
import { StaffService } from "@/services/StaffService";
import { QuotaExceededException } from "@/errors/AppError";

const subscriptionService = new SubscriptionService();
const studentService = new StudentService();
const staffService = new StaffService();

/**
 * Validates whether the tenant has available student seats.
 * Throws QuotaExceededException (HTTP 403) if the student limit has been reached.
 */
export async function checkStudentQuota(tenantId: string, addingCount: number = 1): Promise<void> {
  const limits = await subscriptionService.getPlanLimits(tenantId);
  const currentCount = await studentService.count(tenantId);

  if (currentCount + addingCount > limits.maxStudents) {
    throw new QuotaExceededException(
      `Plan limit reached (${currentCount}/${limits.maxStudents}). Please upgrade your subscription or archive inactive records.`,
      { currentCount, maxAllowed: limits.maxStudents, addingCount, type: "students" }
    );
  }
}

/**
 * Validates whether the tenant has available staff seats.
 * Throws QuotaExceededException (HTTP 403) if the staff limit has been reached.
 */
export async function checkStaffQuota(tenantId: string, addingCount: number = 1): Promise<void> {
  const limits = await subscriptionService.getPlanLimits(tenantId);
  const currentCount = await staffService.count(tenantId);

  if (currentCount + addingCount > limits.maxStaff) {
    throw new QuotaExceededException(
      `Plan limit reached (${currentCount}/${limits.maxStaff}). Please upgrade your subscription or archive inactive records.`,
      { currentCount, maxAllowed: limits.maxStaff, addingCount, type: "staff" }
    );
  }
}
