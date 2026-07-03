"use client";
import { GraduationCap, Calendar, Clock, Loader2, AlertCircle, Users } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🚀 Layered Architecture Hook
import { useParentDashboard } from "@/hooks/useParents";

export default function ParentDashboard() {
  // 1. Fetch Live Parent Dashboard Data
  const { data: children = [], isLoading, error } = useParentDashboard();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 flex flex-col items-center gap-2">
        <AlertCircle size={32} />
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <RequirePermission permissions={[PERMISSIONS.parents.view]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-500">Welcome! Here is an overview of your children.</p>

        {children.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 shadow-sm flex flex-col items-center gap-3">
            <Users size={48} className="text-gray-300" />
            <p className="font-medium">No children linked to your account yet. Please contact school administration.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child: any, idx: number) => (
              <div key={child.id || idx} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">{child.student?.fullName || "N/A"}</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase">Class: {child.student?.classGrade || "N/A"} | Roll: {child.student?.rollNumber || "N/A"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="bg-green-50 text-green-600 p-2 rounded-xl inline-block mb-1"><Clock size={16} /></div>
                    <p className="text-gray-500 font-bold text-[10px] uppercase">Today</p>
                    <p className="text-sm font-black text-gray-900">{child.todayAttendance || "N/A"}</p>
                  </div>
                  <div>
                    <div className="bg-red-50 text-red-600 p-2 rounded-xl inline-block mb-1"><GraduationCap size={16} /></div>
                    <p className="text-gray-500 font-bold text-[10px] uppercase">Fees Due</p>
                    <p className="text-sm font-black text-gray-900">Rs. {child.recentFee?.status === 'pending' ? child.recentFee.amountPaid : 0}</p>
                  </div>
                  <div>
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-xl inline-block mb-1"><Calendar size={16} /></div>
                    <p className="text-gray-500 font-bold text-[10px] uppercase">Next Exam</p>
                    <p className="text-sm font-black text-gray-900">Math</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
