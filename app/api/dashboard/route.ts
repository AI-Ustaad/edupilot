import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      try {
        // متوازی کالز – تیز تر
        const [studentsSnap, staffSnap, feesSnap, attendanceSnap] = await Promise.all([
          adminDb.collection("students").where("tenantId", "==", tenantId).get(),
          adminDb.collection("staff").where("tenantId", "==", tenantId).get(),
          adminDb.collection("fees").where("tenantId", "==", tenantId).orderBy("createdAt", "desc").limit(100).get(),
          adminDb.collection("attendance").where("tenantId", "==", tenantId).orderBy("date", "desc").limit(500).get(),
        ]);

        const totalStudents = studentsSnap.size;
        const totalStaff = staffSnap.size;

        // آمدنی
        let totalRevenue = 0;
        const feesList: any[] = [];
        feesSnap.forEach(doc => {
          const d = doc.data();
          totalRevenue += Number(d.amountPaid || 0);
          feesList.push(d);
        });

        // حاضری کا رجحان (آخری 7 دن)
        const now = new Date();
        const days: { day: string; percent: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().slice(0, 10);
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          days.push({ day: dayName, percent: 0, date: dateStr });
        }

        const attendanceByDate: Record<string, { present: number; total: number }> = {};
        attendanceSnap.forEach(doc => {
          const a = doc.data();
          const date = a.date;
          if (!attendanceByDate[date]) attendanceByDate[date] = { present: 0, total: 0 };
          attendanceByDate[date].total++;
          if (a.status === "Present") attendanceByDate[date].present++;
        });

        const trend = days.map(d => {
          const entry = attendanceByDate[d.date];
          const percent = entry ? Math.round((entry.present / entry.total) * 100) : 0;
          return { day: d.day, percent };
        });

        // آج کی حاضری
        const today = now.toISOString().slice(0, 10);
        const todayData = attendanceByDate[today] || { present: 0, total: 0 };
        const todayAttendance = { present: todayData.present, absent: todayData.total - todayData.present };

        // کلاس ڈسٹریبیوشن
        const classMap: Record<string, number> = {};
        studentsSnap.forEach(doc => {
          const cls = doc.data().classGrade || "Unknown";
          classMap[cls] = (classMap[cls] || 0) + 1;
        });
        const classDistribution = Object.entries(classMap).map(([name, value]) => ({ name, value }));

        // ماہانہ فیس کلکشن (موجودہ مہینہ)
        const currentMonth = now.toLocaleString("default", { month: "long", year: "numeric" });
        let collected = 0;
        feesList.forEach(f => {
          if (f.feeMonth === currentMonth) collected += Number(f.amountPaid || 0);
        });
        const expectedTotal = totalStudents * 5000; // آپ بعد میں حسب ضرورت بنا سکتے ہیں
        const feeMonth = { collected, pending: expectedTotal - collected, total: expectedTotal };

        // کلاس وائز فیس (آخری 5)
        const classFeeMap: Record<string, number> = {};
        feesList.forEach(f => {
          if (f.feeMonth === currentMonth) {
            const cls = f.classGrade || "Unknown";
            classFeeMap[cls] = (classFeeMap[cls] || 0) + Number(f.amountPaid || 0);
          }
        });
        const classFeeSummary = Object.entries(classFeeMap)
          .map(([cls, amt]) => ({ class: cls, collected: amt, total: 5000 }))
          .sort((a, b) => b.collected - a.collected)
          .slice(0, 5);

        // حالیہ ادائیگیاں (آخری 5)
        const recentPayments = feesList
          .slice(0, 5)
          .map(f => ({
            id: f.id,
            studentName: f.studentName,
            amount: Number(f.amountPaid || 0),
            date: f.feeMonth,
            timestamp: f.createdAt?.toDate?.() || new Date(),
          }));

        const data = {
          students: totalStudents,
          staff: totalStaff,
          revenue: totalRevenue,
          todayAttendance,
          attendanceTrend: trend,
          attendanceStats: {
            avg: trend.reduce((s, t) => s + t.percent, 0) / trend.length,
            highest: Math.max(...trend.map(t => t.percent)),
            lowest: Math.min(...trend.map(t => t.percent)),
          },
          feeMonth,
          classFeeSummary,
          recentPayments,
          classDistribution,
        };

        return createApiResponse(200, data);
      } catch (err: any) {
        console.error("Dashboard API error:", err);
        return createApiResponse(500, null, "Failed to load dashboard");
      }
    })
  )
);
