"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, where, addDoc } from "firebase/firestore";
import { Award, Calculator, Save, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function ExamsSystem() {
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState({ class: "1", section: "", term: "1st Term" });
  const [marks, setMarks] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Subects based on your professional result model 
  const subjects = [
    { id: "urdu", name: "Urdu", total: 100 },
    { id: "english", name: "English", total: 100 },
    { id: "math", name: "Math", total: 100 },
    { id: "science", name: "Science", total: 100 },
    { id: "pakStudies", name: "Pak Studies", total: 100 },
    { id: "islamiat", name: "Islamiat", total: 100 }
  ];

  const loadStudents = () => {
    if (!filter.section) return alert("Please enter the Section Name first!");
    const q = query(
      collection(db, "students"), 
      where("class", "==", filter.class),
      where("section", "==", filter.section)
    );

    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoaded(true);
    });
  };

  const handleMarkChange = (studentId: string, subjectId: string, val: string) => {
    // Prevent non-numeric "up/down" steppers as requested
    const num = val === "" ? "" : Number(val);
    if (num !== "" && (num < 0 || num > 100)) return;

    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: num }
    }));
  };

  // Smart Calculation Logic 
  const getStats = (studentId: string) => {
    const sMarks = marks[studentId] || {};
    const obtained = Object.values(sMarks).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
    const percentage = ((obtained / 600) * 100).toFixed(1);
    let grade = "F";
    if (Number(percentage) >= 90) grade = "A+";
    else if (Number(percentage) >= 80) grade = "A";
    else if (Number(percentage) >= 70) grade = "B";
    else if (Number(percentage) >= 33) grade = "C";
    return { obtained, percentage, grade };
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#302B52]">Exams & Grading</h1>
          <p className="text-[#7166F9] font-bold text-xs uppercase tracking-[4px] mt-1">Smart Marks Calculation Engine</p>
        </div>
        <div className="bg-[#302B52] text-white px-8 py-3 rounded-2xl font-black shadow-xl">
          Term: {filter.term}
        </div>
      </div>

      {!isLoaded ? (
        /* 1. SETUP PHASE */
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl p-12 rounded-[50px] shadow-2xl border border-white">
          <div className="flex items-center gap-4 mb-10 text-[#302B52]">
            <Award size={32} className="text-[#7166F9]" />
            <h3 className="text-2xl font-black">Configure Assessment</h3>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <select value={filter.class} onChange={e => setFilter({...filter, class: e.target.value})} className="p-5 bg-[#F8F9FE] rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-200">
              {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>Class {i+1}</option>)}
            </select>
            <input type="text" placeholder="Section Name (e.g. Iqbal)" value={filter.section} onChange={e => setFilter({...filter, section: e.target.value})} className="p-5 bg-[#F8F9FE] rounded-2xl font-bold outline-none border-b-4 border-[#7166F9]" />
          </div>
          <select value={filter.term} onChange={e => setFilter({...filter, term: e.target.value})} className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold outline-none mb-8">
            <option>1st Term</option>
            <option>2nd Term</option>
            <option>Final Term</option>
          </select>
          <button onClick={loadStudents} className="w-full bg-[#302B52] text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-[#7166F9] transition-all">
            Open Grading Table
          </button>
        </div>
      ) : (
        /* 2. GRADING TABLE */
        <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden border border-purple-50">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#302B52] text-white uppercase text-[10px] tracking-widest">
              <tr>
                <th className="p-6 px-8">Student Name</th>
                {subjects.map(sub => <th key={sub.id} className="p-6 text-center">{sub.name}</th>)}
                <th className="p-6 text-center bg-[#7166F9]">Total / %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold text-[#302B52]">
              {students.map(s => {
                const stats = getStats(s.id);
                return (
                  <tr key={s.id} className="hover:bg-purple-50/30 transition-all">
                    <td className="p-6 px-8 leading-tight">
                      {s.fullName} <br/>
                      <span className="text-[9px] text-gray-400 uppercase">Roll: {s.rollNo}</span>
                    </td>
                    {subjects.map(sub => (
                      <td key={sub.id} className="p-4 text-center">
                        <input 
                          type="text" 
                          placeholder="0"
                          value={marks[s.id]?.[sub.id] || ""}
                          onChange={(e) => handleMarkChange(s.id, sub.id, e.target.value)}
                          className="w-16 p-3 bg-[#F8F9FE] rounded-xl text-center outline-none border-b-2 border-transparent focus:border-[#7166F9] font-black text-sm"
                        />
                      </td>
                    ))}
                    <td className="p-6 text-center bg-purple-50/50">
                       <div className="text-sm font-black text-[#7166F9]">{stats.obtained}/600</div>
                       <div className="text-[10px] uppercase text-gray-400">{stats.percentage}% | Grade: {stats.grade}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="p-10 bg-gray-50 flex justify-between items-center">
            <p className="text-gray-400 text-xs italic font-bold max-w-sm">
              * Calculations are performed in real-time. Result cards will follow the one-page professional layout.
            </p>
            <button className="bg-[#302B52] text-white px-12 py-5 rounded-[30px] font-black text-xl shadow-2xl hover:bg-[#7166F9] transition-all flex items-center gap-3">
              <Save size={24} /> Save & Generate Cards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
