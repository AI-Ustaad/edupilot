// app/(protected)/parent/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { GraduationCap, Calendar, Clock, Loader2, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/parents/dashboard");
        if (!res.ok) throw new Error("Failed to fetch parent dashboard data");
        const json = await res.json();
        // Assuming API returns an array of children. We'll take the first one for summary.
        const firstChild = Array.isArray(json.data) ? json.data[0] : json.data;
        setData({
          attendance: firstChild?.todayAttendance === "Present" ? 100 : 0, // Simplified for KPI
          nextExam: "Math Mid-Term", // This can be linked to exams API later
          dueFees: firstChild?.recentFee?.status === "pending" ? firstChild.recentFee.amountPaid : 0,
          childName: firstChild?.student?.fullName || "Your Child"
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (error) return <div className="p-6 text-center text-red-500 flex items-center gap-2"><AlertCircle /> {error}</div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.parents.view]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-500">Welcome! Here is an overview for {data.childName}.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-xl"><Clock size={24} /></div>
            </div>
            <p className="text-gray-500 font-bold text-sm">Today's Attendance</p>
            <p className="text-2xl font-black text-gray-900">{data.attendance > 0 ? "Present" : "Absent"}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Calendar size={24} /></div>
            </div>
            <p className="text-gray-500 font-bold text-sm">Next Exam</p>
            <p className="text-xl font-black text-gray-900">{data.nextExam}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-red-50 text-red-600 p-3 rounded-xl"><GraduationCap size={24} /></div>
            </div>
            <p className="text-gray-500 font-bold text-sm">Fees Due</p>
            <p className="text-2xl font-black text-gray-900">Rs. {data.dueFees || 0}</p>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
