// interfaces/IDashboardService.ts
export interface DashboardData {
  students: number;
  staff: number;
  revenue: number;
  todayAttendance: {
    date?: string;
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  attendanceTrend: { day: string; percent: number; date?: string; isMarked?: boolean; markedCount?: number; label?: string; percentage?: number }[];
  markedTrendSeries?: { day: string; percent: number; date: string; label: string; percentage: number; present: number; absent: number; late: number; totalMarked: number; marked: boolean; isMarked: boolean }[];
  calendarSlots?: { day: string; percent: number | null; date: string; label: string; percentage: number | null; present: number; absent: number; late: number; totalMarked: number; marked: boolean; isMarked: boolean }[];
  attendanceStats: {
    avg: number;
    highest: number;
    lowest: number;
    markedDaysCount?: number;
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
  getDashboardData(tenantId: string, clientDate?: string): Promise<DashboardData>;
  rebuildStats(tenantId: string): Promise<{ students: number; staff: number; revenue: number }>;
}
