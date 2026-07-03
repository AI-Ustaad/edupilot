"use client";
import { Check, X, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { usePendingAdmissions, useUpdateAdmissionStatus } from "@/hooks/useAdmin";
import { TableSkeleton } from "@/components/Skeletons";

export default function AdmissionsPage() {
  const { data: students = [], isLoading } = usePendingAdmissions();
  const updateMutation = useUpdateAdmissionStatus();

  const handleAction = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Admission Approvals</h1>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Admission Approvals</h1>
      
      {students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400 font-medium shadow-sm">
          No pending admissions.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-gray-600 font-bold">Name</th>
                <th className="p-4 text-gray-600 font-bold">Class</th>
                <th className="p-4 text-gray-600 font-bold">Roll No</th>
                <th className="p-4 text-right text-gray-600 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s: any) => (
                <tr 
                  key={s.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    updateMutation.isPending && updateMutation.variables?.id === s.id ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <td className="p-4 font-bold text-gray-900">{s.fullName || s.name}</td>
                  <td className="p-4 text-gray-700 font-medium">{s.classGrade}</td>
                  <td className="p-4 text-gray-700 font-medium">{s.rollNumber || "N/A"}</td>
                  <td className="p-4 text-right space-x-2">
                    <RequirePermission permissions={[PERMISSIONS.students.update]}>
                      <button 
                        onClick={() => handleAction(s.id, "approved")} 
                        disabled={updateMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm disabled:opacity-50"
                      >
                        {updateMutation.isPending && updateMutation.variables?.id === s.id && updateMutation.variables?.status === "approved" ? 
                          <Loader2 size={16} className="animate-spin inline mr-1" /> : <Check size={16} className="inline mr-1" />
                        }
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAction(s.id, "rejected")} 
                        disabled={updateMutation.isPending}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                      >
                        {updateMutation.isPending && updateMutation.variables?.id === s.id && updateMutation.variables?.status === "rejected" ? 
                          <Loader2 size={16} className="animate-spin inline mr-1" /> : <X size={16} className="inline mr-1" />
                        }
                        Reject
                      </button>
                    </RequirePermission>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
