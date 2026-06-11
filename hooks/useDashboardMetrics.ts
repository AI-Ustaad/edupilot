// hooks/useDashboardMetrics.ts
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export interface DashboardMetrics {
  totalStudents: number;
  totalStaff: number;
  totalRevenue: number;
  attendanceRate: number;
  // آپ کے dashboard کے مطابق مزید fields add کر سکتے ہیں
}

export interface StudentRisk {
  studentId: string;
  studentName: string;
  riskScore: number;
  reason: string;
}

export function useDashboardMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard", "metrics", user?.tenantId],
    queryFn: async () => {
      // ✅ Parallel Fetching: دونوں APIs بیک وقت کال ہوں گی
      const [metricsRes, riskRes] = await Promise.all([
        fetch("/api/v1/dashboard").then((res) => {
          if (!res.ok) throw new Error("Failed to fetch metrics");
          return res.json();
        }),
        fetch("/api/v1/students/risk").then((res) => {
          if (!res.ok) throw new Error("Failed to fetch risk data");
          return res.json();
        }),
      ]);

      return {
        metrics: metricsRes.data as DashboardMetrics,
        risks: riskRes.data as StudentRisk[],
      };
    },
    // ✅ Caching: 5 منٹ تک ڈیٹا cache رہے گا (Firestore reads بچیں گے)
    staleTime: 5 * 60 * 1000, 
    // ✅ Auto-refetch: جب user window پر واپس آئے گا تو fresh data آئے گا
    refetchOnWindowFocus: true,
    // ✅ Condition: صرف تب fetch ہو جب tenantId موجود ہو
    enabled: !!user?.tenantId,
  });
}
