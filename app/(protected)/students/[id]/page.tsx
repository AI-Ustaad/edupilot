"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertTriangle } from "lucide-react";

// ⚠️ CTO NOTE: Adjust these paths based on your `find` command output.
// If they are in `@/components/`, change them back. 
import StudentHeader from "@/features/students360/components/StudentHeader"; 
import AttendanceCard from "@/features/students360/components/AttendanceCard";
import AcademicCard from "@/features/students360/components/AcademicCard";
import FeeSummaryCard from "@/features/students360/components/FeeSummaryCard";
import ParentSnapshot from "@/features/students360/components/ParentSnapshot";

export default function Student360Page() {
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

  // 🛡️ DEFENSIVE MAPPING: Map new 'risk' data to old 'healthScore' prop if needed
  // If healthScore is 0-100 (where 100 is good), and risk.score is 0-100 (where 0 is good):
  const healthScore = Math.max(0, 100 - (risk?.score || 0));

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* ✅ CONNECT: Pass both old and new props to prevent Type Errors */}
      <StudentHeader 
        student={student} 
        healthScore={healthScore} 
        risk={risk} // Passed additionally in case the component was updated
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ✅ CONNECT: Pass data, but component will ignore if it doesn't accept props */}
        {/* If AttendanceCard is hardcoded with mock data, you MUST update the component to accept `data={attendance}` */}
        <AttendanceCard data={attendance} riskBreakdown={risk?.breakdown} />
        <AcademicCard data={marks} />
        <FeeSummaryCard data={fees} riskBreakdown={risk?.breakdown} />
      </div>

      {/* ✅ CONNECT: Pass studentId, fallback to no props if component doesn't support it */}
      <ParentSnapshot studentId={studentId} />
      
      {/* 
        ⚠️ FALLBACK UI (Optional): 
        If the above components are strictly hardcoded with mock data and you cannot edit them, 
        uncomment the block below to render the data directly.
      */}
      {/*
      {attendance.length === 0 && marks.length === 0 && fees.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-yellow-800 font-bold">
            Note: Child components are currently using mock data. 
            Please update `AttendanceCard`, `AcademicCard`, and `FeeSummaryCard` to accept `data` props.
          </p>
        </div>
      )}
      */}
    </div>
  );
}
