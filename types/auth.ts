// types/auth.ts

export type UserRole =
  | "super_admin"
  | "admin"
  | "principal"
  | "vice_principal"
  | "coordinator"
  | "teacher"
  | "accountant"
  | "parent";

export interface TenantInfo {
  id: string;
  name?: string;
  domain?: string;
}

export interface SubscriptionInfo {
  plan: string;
  status: string;
}

export interface CurrentUser {
  uid: string;
  email: string;

  role: UserRole;

  permissions: string[];

  tenant: TenantInfo;

  subscription: SubscriptionInfo;

  features: string[];

  onboardingRequired?: boolean;
}
