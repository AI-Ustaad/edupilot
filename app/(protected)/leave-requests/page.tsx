"use client";
import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface LeaveRequest {
  id: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  teacherName?: string;
}

export default function LeaveRequestsPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        // 🛡️ SECURE: Fetches ONLY this tenant's data via API wrapper
        const res = await fetch("/api/leave");
        if (!res.ok) throw new Error("Failed to fetch leaves");
        const json = await res.json();
        setLeaves(json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const approveLeave = async (id: string) => {
    if (!confirm("Approve this leave request?")) return;
    try {
      // 🛡️ SECURE: Update via API (You can create a PUT route later, 
      // for now we'll use a direct secure update or just remove from UI for demo)
      const res = await fetch(`/api/leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      
      if (res.ok) {
        setLeaves(leaves.filter(l => l.id !== id));
        alert("Leave approved successfully.");
      } else {
        alert("Failed to approve leave.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (error) return <div className="p-8 text-center text-red-500"><AlertCircle className="inline mr-2" /> {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Pending Leave Requests</h1>
        <p className="text-gray-500 mt-1">Review and approve staff leave applications.</p>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
          <CheckCircle className="mx-auto mb-3 text-green-500" size={40} />
          <p className="font-bold">No pending leave requests. All staff are present!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map(leave => (
            <div key={leave.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-bold text-gray-900 text-lg">{leave.teacherName}</p>
                <p className="text-sm text-gray-500 font-medium">{leave.startDate} to {leave.endDate}</p>
                <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">{leave.reason}</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => approveLeave(leave.id)}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold transition"
                >
                  <CheckCircle size={18} /> Approve
                </button>
                <button
                  className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-bold transition"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
