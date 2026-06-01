export interface TenantBranding {
  tenantId: string;
  schoolName: string;
  logo?: string;
  primaryColor?: string;
  customDomain?: string;
  timezone?: string;    // e.g., "Asia/Karachi", "America/New_York"
  updatedAt?: Date;
}
