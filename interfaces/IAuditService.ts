import type { AuditLog } from "@/repositories/audit.repository";

// interfaces/IAuditService.ts
export interface AuditLogEntry {
  action: string;
  userId: string;
  tenantId: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
}

export interface IAuditService {
  log(entry: AuditLogEntry): Promise<void>;
  queryByTenant(tenantId: string, options?: { limit?: number; action?: string; entityType?: string }): Promise<any[]>;
}
