"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import StudentHeader from "@/features/students360/components/StudentHeader";
import AttendanceCard from "@/features/students360/components/AttendanceCard";
import FeeSummaryCard from "@/features/students360/components/FeeSummaryCard";
import { StudentProfile } from "@/features/students360/types/student360.types";

const MOCK_STUDENT: StudentProfile = {
  id: "STD-2026-001",
  firstName: "Ahmad",
  lastName: "Ali",
  registrationNo: "EP-00145",
  class: "10th",
  section: "Blue",
  status: "Active",
  admissionDate: "Aug 15, 2025",
};

export default function Student360Page() {
  const params = useParams();
  const studentId = params.id as string;
  const [healthScore] = useState(88);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Master Profile Header */}
      <StudentHeader student={MOCK_STUDENT} healthScore={healthScore} />

      {/* 2. Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64">
            <AttendanceCard />
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-64 flex items-center justify-center text-slate-400 font-medium">
            [Academic Intelligence Component Coming Next]
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-48 flex items-center justify-center text-slate-400 font-medium">
            [Student Timeline Component Coming Next]
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          <div className="h-64">
            <FeeSummaryCard />
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-48 flex items-center justify-center text-slate-400 font-medium">
            [Parent Snapshot Component Coming Next]
          </div>
        </div>

      </div>
    </div>
  );
}
