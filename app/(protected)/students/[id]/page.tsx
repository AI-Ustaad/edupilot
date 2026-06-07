"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertTriangle } from "lucide-react";

// ✅ Correct Import Paths
import StudentHeader from "@/features/students360/components/StudentHeader";
import AttendanceCard from "@/features/students360/components/AttendanceCard";
import AcademicCard from "@/features/students360/components/AcademicCard";
import FeeSummaryCard from "@/features/students360/components/FeeSummaryCard";
import ParentSnapshot from "@/features/students360/components/ParentSnapshot";

export default function Student360Page() {
  // ✅ SAFE PATTERN: useParams
  const params = useParams();
  const studentId = params?.id as string;
  const { user } = useAuth();

  // 🚀 Fetch data via secure API route (React Query)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student360", studentId, user?.tenantId],
    queryFn: async () => {
      // Note: Using /api/students/... because next.config.js rewrites it to /api/v1/...
      const res = await fetch(`/api/students/${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch student 360 data");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "API Error");
      return json.data; 
    },
    enabled: !!user?.tenantId && !!studentId,
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <p className="text-gray-500 font-medium">Loading 360° Student Profile...</p>
      </div>
    );
  }

  // Error State
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-red-50 rounded-2xl border border-red-200">
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Failed to Load Profile</h2>
        <p className="text-gray-600 mt-2">{error?.message || "Student not found or you lack permissions."}</p>
      </div>
    );
  }

  const { student, attendance, risk } = data;

  // 🛡️ Map 'risk' data to 'healthScore' (0-100 where 100 is good)
  const healthScore = Math.max(0, 100 - (risk?.score || 0));

  // 🛡️ Map attendance array to AttendanceCard 'stats' prop
  const present = attendance?.filter((a: any) => a.status === "Present").length || 0;
  const absent = attendance?.filter((a: any) => a.status === "Absent").length || 0;
  const late = attendance?.filter((a: any) => a.status === "Late").length || 0;
  
  const attendanceStats = {
    percentage: risk?.breakdown?.attendance || 0,
    present,
    absent,
    late,
    trend: "stable" as "up" | "down" | "stable"
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* ✅ CONNECT: Pass exact props expected by StudentHeader */}
      <StudentHeader 
        student={student} 
        healthScore={healthScore} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ✅ CONNECT: Pass exact 'stats' prop expected by AttendanceCard */}
        <AttendanceCard stats={attendanceStats} />
        
        {/* 🛑 CTO FIX: These components currently use internal Mock Data and do NOT accept props. 
           We render them empty to prevent Type Errors and Build Failures. 
           They will be upgraded to Props-Driven Components in Phase 2 of the Roadmap. */}
        <AcademicCard />
        <FeeSummaryCard />
      </div>

      {/* ✅ CONNECT: ParentSnapshot takes NO props currently */}
      <ParentSnapshot />
      
    </div>
  );
}
