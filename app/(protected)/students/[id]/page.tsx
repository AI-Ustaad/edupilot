"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertTriangle, TrendingUp, DollarSign, BookOpen } from "lucide-react";
import { use } from "react";

export default function Student360Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student360", resolvedParams.id, user?.tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/students/${resolvedParams.id}`);
      if (!res.ok) throw new Error("Failed to fetch student 360 data");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "API Error");
      return json.data; // Returns { student, attendance, marks, fees, risk }
    },
    enabled: !!user?.tenantId && !!resolvedParams.id,
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
      {/* 1. Student Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-2xl">
          {student.fullName?.charAt(0) || student.name?.charAt(0) || "S"}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-900">{student.fullName || student.name || "Unknown Student"}</h1>
          <p className="text-gray-500 mt-1">
            Class: {student.classGrade} {student.section ? `- Section ${student.section}` : ""} | Roll No: {student.rollNumber || "N/A"}
          </p>
        </div>
        {risk.level === "High" && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold">
            <AlertTriangle size={18} /> At Risk: {risk.reason}
          </div>
        )}
      </div>

      {/* 2. Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Intelligence */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <TrendingUp size={20} /> <h3 className="font-bold text-gray-900">Attendance</h3>
          </div>
          <p className="text-4xl font-black text-gray-900">{risk.breakdown.attendance}%</p>
          <p className="text-sm text-gray-500 mt-1">Recent 30 days average</p>
        </div>

        {/* Academic Intelligence */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <BookOpen size={20} /> <h3 className="font-bold text-gray-900">Recent Marks</h3>
          </div>
          {marks.length > 0 ? (
            <div>
              <p className="text-2xl font-black text-gray-900">{marks[0].subject}</p>
              <p className="text-sm text-gray-500 mt-1">
                {marks[0].marksObtained} / {marks[0].totalMarks} ({marks[0].grade})
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No marks recorded yet.</p>
          )}
        </div>

        {/* Fee Intelligence */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <DollarSign size={20} /> <h3 className="font-bold text-gray-900">Fee Status</h3>
          </div>
          {fees.length > 0 ? (
            <div>
              <p className="text-2xl font-black text-gray-900">Rs {(fees[0].amountPaid || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Last paid: {fees[0].feeMonth || "N/A"} ({risk.breakdown.fees})</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No fee records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
