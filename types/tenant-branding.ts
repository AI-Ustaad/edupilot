export interface TenantBranding {
  tenantId: string;
  schoolName: string;
  logo?: string;
  favicon?: string;
  coverImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  customCSS?: string;
  timezone?: string;    // e.g., "Asia/Karachi", "America/New_York"
  updatedAt?: Date;
}
