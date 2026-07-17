export type Role = "superAdmin" | "schoolAdmin" | "admin" | "teacher" | "parent" | "student" | "guest";

export interface SessionUser {
  uid: string;
  email: string;
  role: Role;
  tenantId: string | null;
  onboardingRequired: boolean;
}

export interface LoginResponseDto {
  success: boolean;
  message: string;
  user: SessionUser;
  redirectTo: string;
}
