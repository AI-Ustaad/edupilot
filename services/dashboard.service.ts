import { adminDb } from "@/lib/firebase-admin";
import { StudentService } from "./StudentService";
import { StudentRepository } from "@/repositories/student.repository";
import { StaffService } from "./StaffService";
import { StaffRepository } from "@/repositories/staff.repository";
import { FeesService } from "./fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import { AttendanceService } from "./attendance.service";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { getOrSet } from "@/lib/cache";

const DASHBOARD_CACHE_TTL = 300; // 5 minutes

export class DashboardService {
  private studentService: StudentService;
  private staffService: StaffService;
  private feesService: FeesService;
  private attendanceService: AttendanceService;

  constructor() {
    this.studentService = new StudentService(new StudentRepository());
    this.staffService = new StaffService();
    this.feesService = new FeesService(new FeesRepository());
    this.attendanceService = new AttendanceService(new AttendanceRepository());
  }

  async getDashboardData(tenantId: string) {
    const cacheKey = `dashboard:${tenantId}`;

    return getOrSet(cacheKey, DASHBOARD_CACHE_TTL, async () => {
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
        this.studentService.count(tenantId),
        this.staffService.count(tenantId),
        this.feesService.getTotalRevenue(tenantId),
        this.attendanceService.getTodayAttendance(tenantId),
        this.attendanceService.getWeeklyAttendanceTrend(tenantId),
        this.studentService.countByClass(tenantId),
        this.feesService.getRecentPayments(tenantId, 5),
        this.studentService.getAnalytics(tenantId),
        this.staffService.getAnalytics(tenantId),
      ]);

      // Build class distribution from countByClass (no full student fetch)
      const classDistribution = Object.entries(classCountMap || {}).map(([name, value]) => ({
        name: name || "Unknown",
        value: value || 0,
      }));

      // Null-safe attendance stats
      const safeAttendanceTrend = attendanceTrend || [];
      const attendanceStats = safeAttendanceTrend.length > 0
        ? {
            avg: Math.round(safeAttendanceTrend.reduce((s, d) => s + (d.percent || 0), 0) / safeAttendanceTrend.length),
            highest: Math.max(...safeAttendanceTrend.map(d => d.percent || 0)),
            lowest: Math.min(...safeAttendanceTrend.map(d => d.percent || 0)),
          }
        : { avg: 0, highest: 0, lowest: 0 };

      // Null-safe today attendance
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
    });
  }

  async rebuildStats(tenantId: string) {
    const [studentCount, staffCount, totalRevenue] = await Promise.all([
      this.studentService.count(tenantId),
      this.staffService.count(tenantId),
      this.feesService.getTotalRevenue(tenantId),
    ]);

    const statsRef = adminDb.collection("tenants").doc(tenantId).collection("dashboard").doc("stats");
    await statsRef.set({
      students: studentCount,
      staff: staffCount,
      revenue: totalRevenue,
      lastRebuildAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { students: studentCount, staff: staffCount, revenue: totalRevenue };
  }
}
