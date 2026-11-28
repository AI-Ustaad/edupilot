import { adminDb } from "@/lib/firebase-admin";
import { StudentService } from "./StudentService";
import { StaffService } from "./StaffService";
import { FeesService } from "./fees.service";
import { AttendanceService } from "./attendance.service";
import type { IDashboardService, DashboardData } from "@/interfaces/IDashboardService";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";
import { resolveStaffCategory } from "@/lib/mappers/StaffPersistenceMapper";
import { computeAttendanceTrend, computeFeeSummary, resolveFeeRecordAmounts } from "@/lib/aggregations/shared-metrics";

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

  async getDashboardData(tenantId: string, clientDate?: string): Promise<DashboardData> {
    const todayStr = clientDate || new Date().toISOString().slice(0, 10);
    try {
      const db = adminDb;

      const [studentsSnap, staffSnap, feesSnap, attendanceSnap] = await Promise.all([
        db.collection("students").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any)),
        db.collection("staff").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any)),
        db.collection("fees").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any)),
        db.collection("attendance").where("tenantId", "==", tenantId).get().catch(() => ({ docs: [] } as any)),
      ]);

      // 1. Students Aggregation — 100% Dynamic from Tenant's Firestore records
      const rawStudents = studentsSnap.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((s: any) => !s.deleted);

      const totalStudents = rawStudents.length;
      let activeStudents = 0;
      let graduatedStudents = 0;
      let transferredStudents = 0;
      let suspendedStudents = 0;
      let archivedStudents = 0;

      const classDistributionMap = new Map<string, number>();

      for (const s of rawStudents) {
        const st = (s.status || "active").toString().toLowerCase().trim();
        if (st === "active" || st === "admitted" || st === "enrolled") {
          activeStudents++;
        } else if (st === "graduated") {
          graduatedStudents++;
        } else if (st === "transferred") {
          transferredStudents++;
        } else if (st === "suspended") {
          suspendedStudents++;
        } else if (st === "archived") {
          archivedStudents++;
        } else {
          activeStudents++;
        }

        const cls = formatClassLabel(s.classGrade || s.className || s.classId || "Class 10");
        const sec = cleanSectionName(s.section || s.sectionName || "A");
        const distKey = `${cls} - Section ${sec}`;
        classDistributionMap.set(distKey, (classDistributionMap.get(distKey) || 0) + 1);
      }

      const classDistribution: { name: string; value: number }[] = [];
      for (const [name, value] of classDistributionMap.entries()) {
        classDistribution.push({ name, value });
      }
      classDistribution.sort((a, b) => b.value - a.value);

      // 2. Staff & Departments Aggregation — 100% Dynamic from Tenant's Firestore records
      const rawStaff = staffSnap.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((st: any) => !st.deleted);

      const totalStaff = rawStaff.length;
      let activeStaff = 0;
      let terminatedStaff = 0;
      let resignedStaff = 0;
      let onLeaveStaff = 0;

      const byDepartment: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const byCampus: Record<string, number> = {};

      for (const st of rawStaff) {
        const sStatus = (st.status || "active").toString().toLowerCase().trim();
        if (sStatus === "active") activeStaff++;
        else if (sStatus === "terminated") terminatedStaff++;
        else if (sStatus === "resigned") resignedStaff++;
        else if (sStatus === "on-leave" || sStatus === "onleave" || sStatus === "leave") onLeaveStaff++;
        else activeStaff++;

        const dept = (st.department || st.professional?.department || "General").trim();
        byDepartment[dept] = (byDepartment[dept] || 0) + 1;

        const roleName = st.designation || st.role || st.professional?.designation || "";
        const cat = resolveStaffCategory(roleName, dept, st.category || st.professional?.category);
        byCategory[cat] = (byCategory[cat] || 0) + 1;

        const campusName = (st.campus || st.professional?.campus || "Main Campus").trim();
        byCampus[campusName] = (byCampus[campusName] || 0) + 1;
      }

      // 3. Fees & Revenue Aggregation — see below (N26)
      const targetMonthLabel = "November 2026";
      const targetMonthPrefix = "nov";

      const activeStudentList = rawStudents.filter((s: any) => {
        const st = (s.status || "active").toString().toLowerCase().trim();
        return st !== "archived" && st !== "suspended" && st !== "graduated" && st !== "transferred";
      });

      const rawFees = feesSnap.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((f: any) => !f.deleted);

      // 3. Fees & Revenue Aggregation — N26: same fee source as the Fees page.
      // The Dashboard used to index fee records by studentId (one record per
      // student, paid preferred) and then iterate STUDENTS, imputing Rs 5,000
      // pending for students with no record — while the Fees page sums the
      // month's fee RECORDS via the shared computeFeeSummary. A record the
      // per-student loop never counted (e.g. an orphan record for a deleted
      // student) therefore made the two pages disagree by exactly Rs 5,000
      // (dashboard Rs 250,000 total / Rs 240,000 pending vs Fees page
      // Rs 255,000 / Rs 245,000 for 51 records). Both pages now aggregate
      // the same record set with the same helper, so Collected + Pending
      // === Total on both, and the class rows sum to the headline totals.
      const monthFeeRecords = rawFees.filter((f: any) => {
        const m = (f.feeMonth || f.financial?.feeMonth || f.month || targetMonthLabel).toString().trim().toLowerCase();
        return m.includes(targetMonthPrefix);
      });

      const feeSummary = computeFeeSummary(monthFeeRecords);
      const collectedFees = feeSummary.totalCollected;
      const pendingFees = feeSummary.totalPending;
      const grossTotal = feeSummary.grossTotal;

      // Per-class breakdown from the SAME records, so the class rows always
      // sum to the headline totals. Class comes from the record itself
      // (reconciled to the roster), falling back to the owning student's
      // class, then "Class 10".
      const studentClassById = new Map<string, string>();
      for (const s of rawStudents) {
        studentClassById.set(s.id, formatClassLabel(s.classGrade || s.className || "Class 10"));
      }
      const classFeeSummaryMap = new Map<string, { collected: number; pending: number; total: number }>();
      for (const f of monthFeeRecords) {
        const cls = formatClassLabel(
          f.classGrade || f.className || studentClassById.get(f.studentId || f.identity?.studentId) || "Class 10"
        );
        if (!classFeeSummaryMap.has(cls)) {
          classFeeSummaryMap.set(cls, { collected: 0, pending: 0, total: 0 });
        }
        const clsSummary = classFeeSummaryMap.get(cls)!;
        const { collected, pending } = resolveFeeRecordAmounts(f);
        clsSummary.collected += collected;
        clsSummary.pending += pending;
        clsSummary.total += collected + pending;
      }

      // Recent payments: paid records for the month, newest first.
      const recentPayments = monthFeeRecords
        .filter((f: any) => (f.status || f.financial?.status || "").toString().toLowerCase().trim() === "paid")
        .map((f: any) => ({
          id: f.id,
          studentName: f.studentName || f.identity?.studentName || "Student",
          amountPaid: resolveFeeRecordAmounts(f).collected,
          feeMonth: targetMonthLabel,
          status: "paid",
          createdAt: f.createdAt || f.metadata?.createdAt || new Date().toISOString(),
        }))
        .sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        })
        .slice(0, 5);

      const classFeeSummary = Array.from(classFeeSummaryMap.entries()).map(([cls, totals]) => ({
        class: cls,
        collected: totals.collected,
        pending: totals.pending,
        total: totals.total,
      })).sort((a, b) => {
        const numA = Number(a.class.replace(/\D/g, "")) || 0;
        const numB = Number(b.class.replace(/\D/g, "")) || 0;
        return numA - numB;
      });

      // 4. Attendance Aggregation — 100% Dynamic from Tenant's Firestore records
      const allAtt = attendanceSnap.docs.map((d: any) => d.data());

      // Query and display viewer's current date (matching /attendance default date)
      // DO NOT fall back to historical dates (e.g. 2026-11-15) when today is unmarked!
      const targetRecords = allAtt.filter((a: any) => a.date === todayStr);

      const presentCount = targetRecords.filter((a: any) => {
        const s = String(a.status || "").toLowerCase().trim();
        return s === "present";
      }).length;
      
      const lateCount = targetRecords.filter((a: any) => {
        const s = String(a.status || "").toLowerCase().trim();
        return s === "late";
      }).length;

      const absentCount = targetRecords.filter((a: any) => {
        const s = String(a.status || "").toLowerCase().trim();
        return s === "absent";
      }).length;

      const totalMarked = presentCount + lateCount + absentCount;
      const unmarkedCount = Math.max(0, activeStudentList.length - totalMarked);
      const percentage = totalMarked > 0 
        ? Math.round(((presentCount + lateCount) / totalMarked) * 100) 
        : 0;

      const todayAttendance = {
        date: todayStr,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        unmarked: unmarkedCount,
        total: totalMarked,
        totalStudents: activeStudentList.length,
        percentage,
      };

      // 5. 7-Day Attendance Trend — Single Source of Truth (Option A — Honest Semantics)
      // Preserves historical marked days (e.g. 11-15 at 100%) in the 7-day window ending today
      const { markedTrendSeries, calendarSlots, attendanceStats } = computeAttendanceTrend(allAtt, todayStr);

      return {
        students: totalStudents,
        staff: totalStaff,
        revenue: collectedFees,
        todayAttendance,
        attendanceTrend: markedTrendSeries,
        markedTrendSeries,
        calendarSlots,
        attendanceStats,
        feeMonth: {
          collected: collectedFees,
          pending: pendingFees,
          total: grossTotal,
          periodLabel: targetMonthLabel,
          totalStudents: activeStudentList.length,
        },
        classFeeSummary,
        recentPayments,
        classDistribution,
        studentStatusBreakdown: {
          active: activeStudents,
          graduated: graduatedStudents,
          transferred: transferredStudents,
          suspended: suspendedStudents,
          archived: archivedStudents,
        },
        staffAnalytics: {
          total: totalStaff,
          active: activeStaff,
          terminated: terminatedStaff,
          resigned: resignedStaff,
          onLeave: onLeaveStaff,
          byDepartment,
          byCategory,
          byCampus,
          byGender: {},
        },
      };
    } catch {
      // Dynamic zero-based fallback
      return {
        students: 0,
        staff: 0,
        revenue: 0,
        todayAttendance: { date: todayStr, present: 0, absent: 0, late: 0, total: 0 },
        attendanceTrend: [],
        markedTrendSeries: [],
        calendarSlots: Array.from({ length: 7 }, (_, idx) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - idx));
          const dateStr = d.toISOString().slice(0, 10);
          return {
            date: dateStr,
            day: dateStr.slice(5),
            label: dateStr.slice(5),
            percentage: null,
            percent: null,
            present: 0,
            absent: 0,
            late: 0,
            totalMarked: 0,
            marked: false,
            isMarked: false,
          };
        }),
        attendanceStats: { avg: 0, highest: 0, lowest: 0, markedDaysCount: 0 },
        feeMonth: { collected: 0, pending: 0, total: 0 },
        classFeeSummary: [],
        recentPayments: [],
        classDistribution: [],
        studentStatusBreakdown: { active: 0, graduated: 0, transferred: 0, suspended: 0, archived: 0 },
        staffAnalytics: {
          total: 0,
          active: 0,
          terminated: 0,
          resigned: 0,
          onLeave: 0,
          byDepartment: {},
          byCategory: {},
          byCampus: { "Main Campus": 0 },
          byGender: {},
        },
      };
    }
  }

  async rebuildStats(tenantId: string): Promise<{ students: number; staff: number; revenue: number }> {
    const [studentCount, staffCount, totalRevenue] = await Promise.all([
      this.studentService.count(tenantId),
      this.staffService.count(tenantId),
      this.feesService.getTotalRevenue(tenantId),
    ]);

    return { students: studentCount, staff: staffCount, revenue: totalRevenue };
  }
}
