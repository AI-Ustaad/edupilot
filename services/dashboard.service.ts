import { StudentService } from "./StudentService";
import { StaffService } from "./StaffService";
import { FeesService } from "./fees.service";
import { AttendanceService } from "./attendance.service";
import { getOrSet } from "@/lib/cache";
import type { IDashboardService, DashboardData } from "@/interfaces/IDashboardService";

const DASHBOARD_CACHE_TTL = 300;

export class DashboardService implements IDashboardService {
  private studentService: StudentService;
  private staffService: StaffService;
  private feesService: FeesService;
  private attendanceService: AttendanceService;

  constructor() {
    this.studentService = new StudentService();
    this.staffService = new StaffService(); 
    this.feesService = new FeesService();
    this.attendanceService = new AttendanceService();
  }

  async getDashboardData(tenantId: string): Promise<DashboardData> {
    const cacheKey = `dashboard:${tenantId}`;

    return getOrSet(cacheKey, async () => {
      const [
        studentsCount,
        staffCount,
        totalRevenue,
        todayAttendance,
        attendanceTrend,
        classCountMap,
        recentPayments,
        studentAnalytics,
        staffAnalytics,
      ] = await Promise.all([
        this.studentService.count(tenantId).catch(() => 0),
        this.staffService.count(tenantId).catch(() => 0),
        this.feesService.getTotalRevenue(tenantId).catch(() => 0),
        this.attendanceService.getTodayAttendance(tenantId).catch(() => null),
        this.attendanceService.getWeeklyAttendanceTrend(tenantId).catch(() => []),
        this.studentService.countByClass(tenantId).catch(() => ({})),
        this.feesService.getRecentPayments(tenantId, 5).catch(() => []),
        this.studentService.getAnalytics(tenantId).catch(() => null),
        this.staffService.getAnalytics(tenantId).catch(() => null),
      ]);

      const classDistribution = Object.entries(classCountMap || {}).map(([name, value]) => ({
        name: name || "Unknown",
        value: (value as number) || 0,
      }));

      const safeAttendanceTrend: { day: string; percent: number }[] = Array.isArray(attendanceTrend) ? attendanceTrend : [];
      
      const attendanceStats = safeAttendanceTrend.length > 0
        ? {
            avg: Math.round(
              safeAttendanceTrend.reduce((s, d) => s + (Number(d?.percent) || 0), 0) / 
              safeAttendanceTrend.length
            ),
            highest: Math.max(...safeAttendanceTrend.map(d => Number(d?.percent) || 0)),
            lowest: Math.min(...safeAttendanceTrend.map(d => Number(d?.percent) || 0)),
          }
        : { avg: 0, highest: 0, lowest: 0 };

      const safeTodayAttendance = todayAttendance || { present: 0, absent: 0, late: 0, total: 0 };

      return {
        students: studentsCount || 0,
        staff: staffCount || 0,
        revenue: totalRevenue || 0,
        todayAttendance: safeTodayAttendance,
        attendanceTrend: safeAttendanceTrend,
        attendanceStats,
        feeMonth: { collected: totalRevenue || 0, pending: 0, total: totalRevenue || 0 },
        classFeeSummary: [],
        recentPayments: recentPayments || [],
        classDistribution,
        studentStatusBreakdown: {
          active: studentAnalytics?.active || 0,
          graduated: studentAnalytics?.graduated || 0,
          transferred: studentAnalytics?.transferred || 0,
          suspended: studentAnalytics?.suspended || 0,
          archived: studentAnalytics?.archived || 0,
        },
        staffAnalytics: {
          total: staffAnalytics?.total || staffCount || 0,
          active: staffAnalytics?.active || 0,
          terminated: staffAnalytics?.terminated || 0,
          resigned: staffAnalytics?.resigned || 0,
          onLeave: staffAnalytics?.onLeave || 0,
          byDepartment: staffAnalytics?.byDepartment || {},
          byCategory: staffAnalytics?.byCategory || {},
          byCampus: staffAnalytics?.byCampus || {},
          byGender: staffAnalytics?.byGender || {},
        },
      };
    }, { ttl: DASHBOARD_CACHE_TTL });
  }

  async rebuildStats(tenantId: string): Promise<{ students: number; staff: number; revenue: number }> {
    const [studentCount, staffCount, totalRevenue] = await Promise.all([
      this.studentService.count(tenantId).catch(() => 0),
      this.staffService.count(tenantId).catch(() => 0),
      this.feesService.getTotalRevenue(tenantId).catch(() => 0),
    ]);

    return { students: studentCount, staff: staffCount, revenue: totalRevenue };
  }
}
