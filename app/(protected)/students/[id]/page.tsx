"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertTriangle } from "lucide-react";

// ✅ Correct Import Paths based on your `find` output
import StudentHeader from "@/features/students360/components/StudentHeader";
import AttendanceCard from "@/features/students360/components/AttendanceCard";
import AcademicCard from "@/features/students360/components/AcademicCard";
import FeeSummaryCard from "@/features/students360/components/FeeSummaryCard";
import ParentSnapshot from "@/features/students360/components/ParentSnapshot";

export default function Student360Page() {
  // ✅ SAFE PATTERN: useParams instead of React 19 'use'
  const params = useParams();
  const studentId = params?.id as string;
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student360", studentId, user?.tenantId],
    queryFn: async () => {
      // 🚨 CTO FIX: Fetching from /api/students/... (NOT /api/v1/...) 
      // Because next.config.js rewrite already adds /v1/ automatically. 
      // Fetching /api/v1/... would cause a double-rewrite 404 error.
      const res = await fetch(`/api/students/${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch student 360 data");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "API Error");
      return json.data; 
    },
    enabled: !!user?.tenantId && !!studentId,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <p className="text-gray-500 font-medium">Loading 360° Student Profile...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-red-50 rounded-2xl border border-red-200">
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Failed to Load Profile</h2>
        <p className="text-gray-600 mt-2">{error?.message || "Student not found or you lack permissions."}</p>
      </div>
    );
  }

  const { student, attendance, marks, fees, risk } = data;

  // 🛡️ Map new 'risk' data to old 'healthScore' prop (0-100 where 100 is good)
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
      
      {/* ✅ FIX 1 APPLIED: Removed 'risk={risk}' to match StudentHeaderProps interface */}
      <StudentHeader 
        student={student} 
        healthScore={healthScore} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ✅ CONNECT: Pass exact 'stats' prop expected by AttendanceCard */}
        <AttendanceCard stats={attendanceStats} />
        
        {/* ✅ CONNECT: Pass data to AcademicCard & FeeSummaryCard 
           Note: If these components strictly expect 'marks' or 'fees' instead of 'data', 
           simply change 'data={marks}' to 'marks={marks}' */}
        <AcademicCard data={marks} />
        <FeeSummaryCard data={fees} />
      </div>

      {/* ✅ CONNECT: ParentSnapshot takes NO props currently, so we call it empty */}
      <ParentSnapshot />
      
    </div>
  );
}
