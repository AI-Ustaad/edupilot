"use client";
import { useEffect, useState } from "react";
import { GraduationCap, Calendar, Clock, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch child's data
    setTimeout(() => {
      setData({ attendance: 92, nextExam: "Math Mid-Term", dueFees: 0 });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.parents.view]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Parent Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-xl"><Clock size={24} /></div>
            </div>
            <p className="text-gray-500 font-bold text-sm">Attendance</p>
            <p className="text-2xl font-black text-gray-900">{data.attendance}%</p>
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
            <p className="text-2xl font-black text-gray-900">Rs. {data.dueFees}</p>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
