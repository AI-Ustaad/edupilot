// lib/api/queryKeys.ts
export const QueryKeys = {
  students: ["students"] as const,
  student: (id: string) => ["students", id] as const,
  
  staff: ["staff"] as const,
  staffMember: (id: string) => ["staff", id] as const,
  
  classes: ["classes"] as const,
  sections: (classGrade: string) => ["classes", classGrade, "sections"] as const,
  
  attendance: ["attendance"] as const,
  attendanceByDate: (classGrade: string, section: string, date: string) => 
    ["attendance", classGrade, section, date] as const,
    
  fees: ["fees"] as const,
  feesByMonth: (month: string, classGrade: string) => ["fees", month, classGrade] as const,
  
  parents: ["parents"] as const,
  
  dashboard: ["dashboard"] as const,
  analytics: ["analytics"] as const,
  
  reports: ["reports"] as const,
  
  exams: ["exams"] as const,
  marks: (classGrade: string, section: string, term: string) => 
    ["marks", classGrade, section, term] as const,
    
  subscriptions: ["subscriptions"] as const,
};
