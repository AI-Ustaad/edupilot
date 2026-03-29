"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  useEffect(() => {
    return onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div className="p-8 md:p-12 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#302B52]">Daily Attendance</h1>
        <div className="text-sm font-bold bg-white px-6 py-3 rounded-xl shadow-sm">Date: {new Date().toLocaleDateString()}</div>
      </div>

      <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-purple-50">
        <table className="w-full text-left">
          <thead className="bg-[#302B52] text-white uppercase text-[10px] tracking-widest">
            <tr>
              <th className="p-8">Student</th>
              <th className="p-8">Class</th>
              <th className="p-8 text-center">Mark Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 font-bold text-[#302B52]">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-purple-50 transition-all">
                <td className="p-6 px-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#7166F9]/10 rounded-lg flex items-center justify-center text-[#7166F9]">{s.fullName[0]}</div>
                  {s.fullName}
                </td>
                <td className="p-6 px-8 text-gray-400 uppercase text-xs">{s.class}-{s.section}</td>
                <td className="p-6 px-8">
                  <div className="flex justify-center gap-4">
                    {['P', 'A', 'L'].map(status => (
                      <button 
                        key={status}
                        onClick={() => setAttendance({...attendance, [s.id]: status})}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                          attendance[s.id] === status ? 'bg-[#7166F9] text-white border-[#7166F9]' : 'bg-white border-gray-100 text-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
