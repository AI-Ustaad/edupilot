// interfaces/IDashboardService.ts
export interface DashboardData {
  students: number;
  staff: number;
  revenue: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  attendanceTrend: { day: string; percent: number }[];
  attendanceStats: {
    avg: number;
    highest: number;
    lowest: number;
  };
  feeMonth: {
    collected: number;
    pending: number;
    total: number;
  };
  classFeeSummary: any[];
  recentPayments: any[];
  classDistribution: { name: string; value: number }[];
  studentStatusBreakdown: {
    active: number;
    graduated: number;
    transferred: number;
    suspended: number;
    archived: number;
  };
  staffAnalytics: {
    total: number;
    active: number;
    terminated: number;
    resigned: number;
    onLeave: number;
    byDepartment: Record<string, number>;
    byCategory: Record<string, number>;
    byCampus: Record<string, number>;
    byGender: Record<string, number>;
  };
}

export interface IDashboardService {
  getDashboardData(tenantId: string): Promise<DashboardData>;
  rebuildStats(tenantId: string): Promise<{ students: number; staff: number; revenue: number }>;
}
