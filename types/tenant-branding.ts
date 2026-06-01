export interface TenantBranding {
  tenantId: string;
  schoolName: string;
  logo?: string;           // URL
  primaryColor?: string;   // e.g., "#3b82f6"
  customDomain?: string;   // e.g., "myschool.edupilot.com"
  updatedAt?: Date;
}
