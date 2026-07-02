// lib/api/queryKeys.ts
export const QueryKeys = {
  students: (tenantId: string) => ["students", tenantId] as const,
  student: (tenantId: string, id: string) => ["students", tenantId, id] as const,
  
  staff: (tenantId: string) => ["staff", tenantId] as const,
  staffMember: (tenantId: string, id: string) => ["staff", tenantId, id] as const,
  
  classes: (tenantId: string) => ["classes", tenantId] as const,
  sections: (tenantId: string, classGrade: string) => ["classes", tenantId, classGrade, "sections"] as const,
  
  attendance: (tenantId: string, classGrade: string, section: string, date: string) => 
    ["attendance", tenantId, classGrade, section, date] as const,
    
  fees: (tenantId: string, month: string, classGrade: string) => 
    ["fees", tenantId, month, classGrade] as const,
  
  parents: (tenantId: string) => ["parents", tenantId] as const,
  
  dashboard: (tenantId: string) => ["dashboard", tenantId] as const,
  analytics: (tenantId: string) => ["analytics", tenantId] as const,
};
