"use client";
import { Users, ArrowUpRight, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { usePromoteStudents } from "@/hooks/useAdmin";

export default function PromoteStudentsPage() {
  const promoteMutation = usePromoteStudents();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <ArrowUpRight className="text-blue-600" size={28} /> Promote Students
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <Users className="mx-auto text-blue-100 mb-4" size={80} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Academic Year End Promotion</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          This automated process will evaluate all current active students and move them to the next academic level based on your school&apos;s promotion map.
        </p>
        
        <RequirePermission permissions={[PERMISSIONS.students.update]}>
          <button
            onClick={() => {
              if (confirm("Are you absolutely sure you want to promote all students?")) {
                promoteMutation.mutate();
              }
            }}
            disabled={promoteMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 mx-auto font-black shadow-md transition disabled:opacity-50 text-lg"
          >
            {promoteMutation.isPending ? <Loader2 className="animate-spin" size={24} /> : <ArrowUpRight size={24} />}
            {promoteMutation.isPending ? "Processing..." : "Promote All Students Now"}
          </button>
        </RequirePermission>
      </div>
    </div>
  );
}
