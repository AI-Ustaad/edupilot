"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { ClipboardCheck, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  useEffect(() => {
    return onSnapshot(collection(db, "students"), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const markAttendance = (id: string, status: string) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    await addDoc(collection(db, "attendance"), {
      date: new Date().toISOString().split('T')[0],
      records: attendance
    });
    alert("Daily Register Saved!");
  };

  return (
    <div className="p-10 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-[#302B52]">Daily Register</h1>
        <button onClick={handleSave} className="bg-[#7166F9] text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2">
          <ClipboardCheck size={20}/> Save Daily Register
        </button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-purple-50 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#302B52] text-white uppercase text-xs tracking-widest">
              <th className="p-6">Roll No</th>
              <th className="p-6">Student Name</th>
              <th className="p-6 text-center">Mark Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map(s => (
              <tr key={s.id} className="hover:bg-purple-50/50 transition-all font-bold text-[#302B52]">
                <td className="p-6">{s.rollNo}</td>
                <td className="p-6">{s.fullName}</td>
                <td className="p-6">
                  <div className="flex justify-center gap-4">
                    {['P', 'A', 'L'].map(status => (
                      <button 
                        key={status}
                        onClick={() => markAttendance(s.id, status)}
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
