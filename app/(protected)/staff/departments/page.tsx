"use client";
import { Building2, Users } from "lucide-react";
import { useStaffAnalytics } from "@/hooks/useStaff";

export default function StaffDepartmentsPage() {
  const { data: analytics } = useStaffAnalytics();

  const departments = analytics?.byDepartment
    ? Object.entries(analytics.byDepartment).map(([name, count]) => ({ name, count: count as number }))
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Building2 className="text-blue-600" /> Departments
        </h1>
        <p className="text-gray-500 text-sm">Staff distribution across departments.</p>
      </div>

      {departments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-bold text-gray-500">No department data available</p>
          <p className="text-sm text-gray-400 mt-2">Add staff with department assignments to see data here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{dept.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{dept.count} staff member{dept.count !== 1 ? "s" : ""}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users size={24} className="text-blue-600" />
                </div>
              </div>
              <div className="mt-4 bg-gray-100 rounded-full h-2">
                <div className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (dept.count / (analytics?.total || 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
