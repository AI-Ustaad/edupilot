"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, addDoc } from "firebase/firestore";
import { ClipboardCheck, Users, Search, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AttendanceRegister() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState({ class: "1", section: "" });
  const [isLoaded, setIsLoaded] = useState(false);

  // REAL-TIME SYNC: Only loads students for the selected Class/Section
  const loadRegister = () => {
    if (!filter.section) return alert("Please type your Section Name first!");
    
    const q = query(
      collection(db, "students"), 
      where("class", "==", filter.class),
      where("section", "==", filter.section)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
      setIsLoaded(true);
      // Initialize all as Present ('P') by default to save teacher time
      const initial: Record<string, string> = {};
      list.forEach(s => initial[s.id] = "P");
      setAttendance(initial);
    });
    return () => unsub();
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, "attendance"), {
        date: new Date().toISOString().split('T')[0],
        class: filter.class,
        section: filter.section,
        records: attendance,
        timestamp: new Date().toISOString()
      });
      alert("Daily Register Saved Successfully!");
    } catch (err) {
      console.error("Attendance Error:", err);
    }
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#302B52]">Daily Attendance</h1>
          <p className="text-[#7166F9] font-bold text-xs uppercase tracking-[4px] mt-1">Smart Register System</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-[24px] shadow-xl flex items-center gap-3 border border-purple-50 font-black text-[#302B52]">
          <Clock className="text-[#7166F9]" />
          {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* FILTER HEADER */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white mb-10 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Select Class</label>
          <select 
            value={filter.class} 
            onChange={(e) => setFilter({...filter, class: e.target.value})}
            className="w-full mt-2 p-4 bg-[#F8F9FE] rounded-2xl font-bold text-[#302B52] outline-none border-2 border-transparent focus:border-purple-200"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i+1} value={i+1}>Class {i+1}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Type Section Name</label>
          <input 
            type="text" 
            placeholder="e.g. Iqbal" 
            value={filter.section}
            onChange={(e) => setFilter({...filter, section: e.target.value})}
            className="w-full mt-2 p-4 bg-[#F8F9FE] rounded-2xl font-bold text-[#302B52] outline-none border-b-4 border-[#7166F9]"
          />
        </div>
        <button 
          onClick={loadRegister}
          className="bg-[#302B52] text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-[#7166F9] transition-all"
        >
          Load Students
        </button>
      </div>

      {/* ATTENDANCE TABLE */}
      {isLoaded && (
        <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden border border-purple-50">
          <table className="w-full text-left">
            <thead className="bg-[#302B52] text-white uppercase text-[10px] tracking-[3px]">
              <tr>
                <th className="p-8">Adm No</th>
                <th className="p-8">Student Name</th>
                <th className="p-8 text-center">Status (P / A / L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length > 0 ? students.map(s => (
                <tr key={s.id} className="hover:bg-purple-50/30 transition-all font-bold text-[#302B52]">
                  <td className="p-6 px-8 text-[#7166F9]">#{s.admissionNo}</td>
                  <td className="p-6 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F8F9FE] rounded-xl flex items-center justify-center text-[10px] uppercase">{s.fullName[0]}</div>
                      {s.fullName}
                    </div>
                  </td>
                  <td className="p-6 px-8">
                    <div className="flex justify-center gap-3">
                      {['P', 'A', 'L'].map(status => (
                        <button 
                          key={status}
                          onClick={() => setAttendance({...attendance, [s.id]: status})}
                          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                            attendance[s.id] === status 
                            ? 'bg-[#7166F9] text-white border-[#7166F9] shadow-lg scale-110' 
                            : 'bg-white border-gray-100 text-gray-300 hover:border-purple-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-20 text-center text-gray-300 italic font-bold">
                    No students found in Class {filter.class}-{filter.section}. Check your enrollment data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {students.length > 0 && (
            <div className="p-10 bg-[#F8F9FE] flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-[#7166F9] text-white px-12 py-5 rounded-[30px] font-black text-xl shadow-2xl hover:bg-[#302B52] transition-all flex items-center gap-3"
              >
                <ClipboardCheck size={24} /> Submit Today's Register
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
