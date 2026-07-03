"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { TableSkeleton } from "@/components/Skeletons";

export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: leaves = [], isLoading, isError } = useQuery({
    queryKey: ["leaves", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/leave")),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => 
      apiClient.put(`/leave/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves", tenantId] });
      showToast("Leave request updated.", "success");
    },
    onError: () => showToast("Failed to update leave request.", "error"),
  });

  if (isLoading) return <div className="p-8"><TableSkeleton rows={4} cols={2} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3"><AlertCircle size={32} /> Failed to load leave requests.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-black text-gray-900">Pending Leave Requests</h1>
        <p className="text-gray-500 mt-1">Review and approve staff leave applications.</p>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <p className="font-bold text-lg text-gray-800">No pending leave requests.</p>
          <p className="text-sm">All staff are present and accounted for!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave: any) => (
            <div key={leave.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
              <div className="w-full">
                <p className="font-black text-gray-900 text-lg">{leave.teacherName || "Unknown Staff"}</p>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100">
                  {leave.startDate} TO {leave.endDate}
                </p>
                <p className="text-sm text-gray-700 mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">&quot;{leave.reason}&quot;</p>
              </div>
              
              <RequirePermission permissions={[PERMISSIONS.staff.update]}>
                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: leave.id, status: "approved" })}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: leave.id, status: "rejected" })}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition disabled:opacity-50"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </RequirePermission>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
