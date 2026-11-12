"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, AlertCircle, PlusCircle, X, Calendar, User, FileText } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { TableSkeleton } from "@/components/Skeletons";
import { useStaff } from "@/hooks/useStaff";

export default function LeaveRequestsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: staffList = [] } = useStaff();

  const [showModal, setShowModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

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

  const createLeaveMutation = useMutation({
    mutationFn: async (payload: any) => apiClient.post("/leave", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves", tenantId] });
      showToast("Leave request submitted successfully.", "success");
      setShowModal(false);
      setSelectedStaffId("");
      setReason("");
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to submit leave request.", "error");
    },
  });

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      showToast("Please select a staff member.", "info");
      return;
    }
    if (!startDate || !endDate) {
      showToast("Please provide both start and end dates.", "info");
      return;
    }
    const staffMember = (staffList as any[]).find((s) => (s.staffId || s.id) === selectedStaffId);
    const teacherName = staffMember?.fullName || staffMember?.name || "Staff Member";

    createLeaveMutation.mutate({
      teacherId: selectedStaffId,
      teacherName,
      leaveType,
      startDate,
      endDate,
      reason: reason || "Personal Reasons",
    });
  };

  if (isLoading) return <div className="p-8"><TableSkeleton rows={4} cols={2} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3"><AlertCircle size={32} /> Failed to load leave requests.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pending Leave Requests</h1>
          <p className="text-gray-500 mt-1">Review, approve, and submit staff leave applications.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-sm"
        >
          <PlusCircle size={18} /> Submit Leave Request
        </button>
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
                <div className="flex items-center gap-2">
                  <p className="font-black text-gray-900 text-lg">{leave.teacherName || "Staff Member"}</p>
                  {leave.leaveType && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {leave.leaveType}
                    </span>
                  )}
                </div>
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

      {/* Submit Leave Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-black text-gray-900 mb-1 flex items-center gap-2">
              <PlusCircle className="text-blue-600" size={24} /> Submit Staff Leave Request
            </h2>
            <p className="text-xs text-gray-500 mb-6">Create a leave application on behalf of a staff member.</p>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Staff Member *
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Select Staff Member</option>
                  {(staffList as any[]).map((st) => {
                    const sid = st.staffId || st.id;
                    const sname = st.fullName || st.name || "Staff";
                    const sdesig = st.designation || st.role || "Teacher";
                    return (
                      <option key={sid} value={sid}>
                        {sname} ({sdesig})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:border-blue-400"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical / Sick Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Maternity/Paternity">Maternity / Paternity</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Reason for Leave
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Urgent family emergency or medical appointment"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLeaveMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createLeaveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
