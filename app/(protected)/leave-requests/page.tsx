"use client";
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
    alert("Leave approved.");
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={40}/></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6">Pending Leave Requests</h1>
      {leaves.length === 0 ? (
        <div className="glass-card p-10 text-center text-white/50">No pending leave requests.</div>
      ) : (
        <div className="space-y-4">
          {leaves.map(leave => (
            <div key={leave.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-bold text-white">{leave.teacherName}</p>
                <p className="text-sm text-white/60">{leave.startDate} to {leave.endDate}</p>
                <p className="text-sm text-white/70">{leave.reason}</p>
              </div>
              <button onClick={() => approveLeave(leave.id)} className="btn-primary flex items-center gap-2">
                <CheckCircle size={18} /> Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
