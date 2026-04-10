"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, Search, Users, CalendarDays, Check, X, Clock } from "lucide-react";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch All Students Once
  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("rollNumber", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Dynamic Dropdowns Logic (The Magic)
  const availableClasses = Array.from(new Set(students.map(s => s.classGrade))).filter(Boolean);
  
  // جب کلاس سیلیکٹ ہو، تو صرف اسی کلاس کے سیکشنز دکھاؤ
  const availableSections = Array.from(
    new Set(students.filter(s => s.classGrade === selectedClass).map(s => s.section))
  ).filter(Boolean);

  // 3. Filter Students for List
  const filteredStudents = students.filter(s => {
    const matchClass = selectedClass ? s.classGrade === selectedClass : false;
    const matchSection = selectedSection ? s.section === selectedSection : true; // Section is optional
    const matchSearch = searchQuery ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNumber?.toString().includes(searchQuery) : true;
    return matchClass && matchSection && matchSearch;
  });

  const handleMarkAttendance = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (Object.keys(attendanceRecords).length === 0) return alert("Please mark attendance for at least one student.");
    setIsSaving(true);
    try {
      // Save each record to Firestore
      for (const [studentId, status] of Object.entries(attendanceRecords)) {
        const recordId = `${studentId}_${attendanceDate}`;
        await setDoc(doc(db, "attendance", recordId), {
          studentId,
          date: attendanceDate,
          status,
          classGrade: selectedClass,
          section: selectedSection,
          markedAt: serverTimestamp()
        });
      }
      alert("Attendance Saved Successfully!");
    } catch (error) {
      console.error("Error saving attendance", error);
      alert("Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Daily Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">Smart register with dynamic sections and quick search.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Class Dropdown (Dynamic) */}
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3ac47d]/50 font-bold text-slate-700 min-w-[150px]">
            <option value="" disabled>Select Class</option>
            {availableClasses.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
          </select>

          {/* Section Dropdown (Cascading - Only shows if class is selected) */}
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass || availableSections.length === 0} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3ac47d]/50 font-bold text-slate-700 disabled:opacity-50 min-w-[150px]">
            <option value="">All Sections</option>
            {availableSections.map(s => <option key={s as string} value={s as string}>Section {s as string}</option>)}
          </select>
        </div>

        {/* Date & Search */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-64">
            <Search className="absolute left-3 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name or roll..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3ac47d]/50" />
          </div>
          <div className="relative flex items-center">
            <CalendarDays className="absolute left-3 text-slate-400" size={18} />
            <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3ac47d]/50 font-medium text-slate-600" />
          </div>
        </div>
      </div>

      {/* Attendance Register */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0F172A] px-6 py-4 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Roll No</div>
          <div className="col-span-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Student Name</div>
          <div className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status (P / A / L)</div>
        </div>

        <div className="divide-y divide-slate-100">
          {!selectedClass ? (
            <div className="py-16 text-center flex flex-col items-center opacity-50">
              <Users size={48} className="text-slate-300 mb-4" />
              <p className="font-bold text-slate-500">Please select a class to load students.</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-bold text-slate-500">No students found matching your criteria.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-2 font-black text-slate-300 text-lg">{student.rollNumber || "-"}</div>
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-slate-400" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{student.name}</p>
                    <p className="text-[11px] text-slate-500">Class {student.classGrade} {student.section && `- ${student.section}`}</p>
                  </div>
                </div>
                <div className="col-span-4 flex items-center justify-center gap-2">
                  <button onClick={() => handleMarkAttendance(student.id, "Present")} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${attendanceRecords[student.id] === 'Present' ? 'bg-[#3ac47d] text-white shadow-md shadow-[#3ac47d]/30 scale-110' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}><Check size={18} /></button>
                  <button onClick={() => handleMarkAttendance(student.id, "Absent")} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${attendanceRecords[student.id] === 'Absent' ? 'bg-red-500 text-white shadow-md shadow-red-500/30 scale-110' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}><X size={18} /></button>
                  <button onClick={() => handleMarkAttendance(student.id, "Leave")} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${attendanceRecords[student.id] === 'Leave' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-110' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`}><Clock size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Save Button */}
        {filteredStudents.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={handleSaveAttendance} disabled={isSaving} className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70">
              {isSaving ? "Saving Records..." : <><CheckCircle2 size={18} /> Save Register</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
