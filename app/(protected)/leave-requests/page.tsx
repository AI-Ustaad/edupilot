"use client";
export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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
  const [teachers, setTeachers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffSnap, leavesSnap] = await Promise.all([
          getDocs(collection(db, "staff")),
          getDocs(query(collection(db, "leave_requests"), where("status", "==", "pending")))
        ]);
        const teacherMap: Record<string, string> = {};
        staffSnap.docs.forEach(d => {
          teacherMap[d.id] = d.data().personal?.fullName || "Unknown";
        });
        setTeachers(teacherMap);
        const leavesList = leavesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          teacherName: teacherMap[doc.data().teacherId]
        })) as LeaveRequest[];
        setLeaves(leavesList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const approveLeave = async (id: string) => {
    await updateDoc(doc(db, "leave_requests", id), { status: "approved" });
    setLeaves(leaves.filter(l => l.id !== id));
    alert("Leave approved. You can now assign substitute from the arrange panel.");
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Pending Leave Requests</h1>
      {leaves.length === 0 ? (
        <p className="text-slate-400">No pending leave requests.</p>
      ) : (
        <div className="space-y-4">
          {leaves.map(leave => (
            <div key={leave.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border flex justify-between items-center">
              <div>
                <p className="font-bold">{leave.teacherName}</p>
                <p className="text-sm text-slate-500">{leave.startDate} to {leave.endDate}</p>
                <p className="text-sm">{leave.reason}</p>
              </div>
              <button onClick={() => approveLeave(leave.id)} className="bg-green-600 text-gray-900 px-4 py-2 rounded-xl flex items-center gap-2"><CheckCircle size={18} /> Approve</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
