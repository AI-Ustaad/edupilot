import { adminDb } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/config/subscription-plans";
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";

export interface PlanLimits {
  students: number;
  staff: number;
}

export async function getTenantSubscription(tenantId: string) {
  const subDoc = await adminDb.collection("subscriptions").doc(tenantId).get();
  if (!subDoc.exists) {
    return { planId: "free", status: "active", limits: { students: PLANS.free.maxStudents, staff: PLANS.free.maxStaff } };
  }
  const subData = subDoc.data() as any;
  const plan = PLANS[subData.planId] || PLANS.free;
  return {
    planId: subData.planId || "free",
    status: subData.status || "active",
    limits: { students: plan.maxStudents, staff: plan.maxStaff },
  };
}

export async function getTenantUsage(tenantId: string) {
  const studentRepo = new StudentRepository();
  const staffRepo = new StaffRepository();
  const [studentsUsed, staffUsed] = await Promise.all([
    studentRepo.count(tenantId),
    staffRepo.count(tenantId),
  ]);
  
  return {
    studentsUsed,
    staffUsed,
  };
}

export async function canAddStudent(tenantId: string): Promise<{ allowed: boolean; message?: string }> {
  const { limits } = await getTenantSubscription(tenantId);
  const { studentsUsed } = await getTenantUsage(tenantId);
  
  if (studentsUsed >= limits.students) {
    return {
      allowed: false,
      message: `You have reached the student limit (${limits.students}) of your plan. Please upgrade your plan to add more students.`
    };
  }
  return { allowed: true };
}

export async function canAddStaff(tenantId: string): Promise<{ allowed: boolean; message?: string }> {
  const { limits } = await getTenantSubscription(tenantId);
  const { staffUsed } = await getTenantUsage(tenantId);
  
  if (staffUsed >= limits.staff) {
    return {
      allowed: false,
      message: `You have reached the staff limit (${limits.staff}) of your plan. Please upgrade your plan to add more staff.`
    };
  }
  return { allowed: true };
}
