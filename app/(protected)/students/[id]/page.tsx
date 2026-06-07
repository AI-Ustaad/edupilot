"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertTriangle } from "lucide-react";

// ✅ CONNECT, DON'T REPLACE: Import your existing components
// (Adjust the import paths below to match your actual folder structure)
import StudentHeader from "@/components/StudentHeader"; 
import AttendanceCard from "@/components/AttendanceCard";
import AcademicCard from "@/components/AcademicCard";
import FeeSummaryCard from "@/components/FeeSummaryCard";
import ParentSnapshot from "@/components/ParentSnapshot";

export default function Student360Page() {
  // ✅ SAFE PATTERN: useParams instead of React 19 'use'
  const params = useParams();
  const studentId = params?.id as string;
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student360", studentId, user?.tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/students/${studentId}`);
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

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* ✅ CONNECT: Pass data to existing components instead of writing raw divs */}
      
      <StudentHeader student={student} risk={risk} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AttendanceCard data={attendance} riskBreakdown={risk.breakdown} />
        <AcademicCard data={marks} />
        <FeeSummaryCard data={fees} riskBreakdown={risk.breakdown} />
      </div>

      <ParentSnapshot studentId={studentId} />
    </div>
  );
}
