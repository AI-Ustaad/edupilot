// services/dashboard.service.ts
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
        allStudents,
        recentPayments,
      ] = await Promise.all([
        this.studentService.count(tenantId),
        this.staffService.count(tenantId),
        this.feesService.getTotalRevenue(tenantId),
        this.attendanceService.getTodayAttendance(tenantId),
        this.attendanceService.getWeeklyAttendanceTrend(tenantId),
        this.studentService.paginate(tenantId, 1, 9999),
        this.feesService.getRecentPayments(tenantId, 5),
      ]);

      const classMap: Record<string, number> = {};
      allStudents.data.forEach((student: any) => {
        const cls = student.classGrade || "Unknown";
        classMap[cls] = (classMap[cls] || 0) + 1;
      });
      const classDistribution = Object.entries(classMap).map(([name, value]) => ({ name, value }));

      // 🔥 حقیقی اوسط، زیادہ سے زیادہ، کم سے کم — اب کوئی جعلی نمبر نہیں
      const attendanceStats = attendanceTrend.length > 0
        ? {
            avg: Math.round(attendanceTrend.reduce((s, d) => s + d.percent, 0) / attendanceTrend.length),
            highest: Math.max(...attendanceTrend.map(d => d.percent)),
            lowest: Math.min(...attendanceTrend.map(d => d.percent)),
          }
        : { avg: 0, highest: 0, lowest: 0 };

      return {
        students: studentsCount,
        staff: staffCount,
        revenue: totalRevenue,
        todayAttendance,
        attendanceTrend,
        attendanceStats,             // ← یہاں حقیقی ڈیٹا
        feeMonth: { collected: totalRevenue, pending: 0, total: totalRevenue },
        classFeeSummary: [],
        recentPayments,
        classDistribution,
      };
    });
  }
}
