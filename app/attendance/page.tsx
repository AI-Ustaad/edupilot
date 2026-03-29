"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { ClipboardCheck } from "lucide-react";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});

  useEffect(() => {
    return onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black text-[#302B52] mb-10">Daily Attendance Register</h1>
      <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-purple-50">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#302B52] text-white uppercase text-[10px] tracking-widest">
            <tr>
              <th className="p-8">Admission No</th>
              <th className="p-8">Student Name</th>
              <th className="p-8 text-center">P / A / L</th>
            </tr>
          </thead>
          <tbody className="font-bold text-[#302B52]">
            {students.length > 0 ? students.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-purple-50/30 transition-all">
                <td className="p-6 px-8">{s.admissionNo}</td>
                <td className="p-6 px-8">{s.fullName}</td>
                <td className="p-6 px-8 flex justify-center gap-4">
                  {['P', 'A', 'L'].map(status => (
                    <button key={status} onClick={() => setMarks({...marks, [s.id]: status})} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${marks[s.id] === status ? 'bg-[#7166F9] text-white border-[#7166F9]' : 'bg-white border-gray-100 text-gray-300'}`}>
                      {status}
                    </button>
                  ))}
                </td>
              </tr>
            )) : <tr><td colSpan={3} className="text-center py-20 text-gray-300 font-bold italic">No students enrolled yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
