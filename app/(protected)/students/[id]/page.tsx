"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import StudentHeader from "@/features/students360/components/StudentHeader";
import AttendanceCard from "@/features/students360/components/AttendanceCard";
import FeeSummaryCard from "@/features/students360/components/FeeSummaryCard";
import AcademicCard from "@/features/students360/components/AcademicCard";
import ParentSnapshot from "@/features/students360/components/ParentSnapshot";
import { StudentProfile } from "@/features/students360/types/student360.types";

export default function Student360Page() {
  const params = useParams();
  const studentId = params.id as string;

  // React Query Fetching logic
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student360", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/students/360?id=${studentId}`);

      if (!res.ok) {
        throw new Error("Failed to load student");
      }

      const json = await res.json();
      return json.data || json; // Handle cases where data might be nested or direct
    },
    enabled: !!studentId,
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error State
  if (isError || !data) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Student profile could not be loaded.
      </div>
    );
  }

  // Health Score Calculation based on API Data
  const attendancePercent =
    data?.attendanceTrend?.length
      ? data.attendanceTrend[data.attendanceTrend.length - 1].percentage
      : 0;

  const marksPercent =
    data?.marksTrend?.length
      ? data.marksTrend[data.marksTrend.length - 1].percentage
      : 0;

  const feePercent = 100;

  const healthScore = Math.round(
    attendancePercent * 0.4 +
    marksPercent * 0.4 +
    feePercent * 0.2
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Master Profile Header */}
      <StudentHeader student={data.student} healthScore={healthScore} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64">
            {/* Keeping it untouched as ordered */}
            <AttendanceCard />
          </div>
          
          <div className="h-64">
            {/* Keeping it untouched as ordered */}
            <AcademicCard />
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-48 flex items-center justify-center text-slate-400 font-medium">
            [Student Timeline Component Coming Soon]
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          <div className="h-64">
            {/* Keeping it untouched as ordered */}
            <FeeSummaryCard />
          </div>
          
          <div className="h-64">
            {/* Keeping it untouched as ordered */}
            <ParentSnapshot />
          </div>
        </div>

      </div>
    </div>
  );
}
