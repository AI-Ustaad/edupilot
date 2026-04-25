"use client";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ClipboardCheck, Calendar, Users, CheckCircle2, 
  XCircle, Clock, Save, Loader2, Search, AlertCircle 
} from "lucide-react";

const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function AttendancePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // 🗓️ Filters State
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  
  // 🗃️ Data State
  const [classesList, setClassesList] = useState<string[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // ✅ Attendance State: { studentId: "Present" | "Absent" | "Leave" }
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsMounted(true);
    // Fetch unique classes and sections for dropdowns
    const fetchDropdowns = async () => {
      const snap = await getDocs(collection(db, "sections"));
      const secs = snap.docs.map(d => d.data());
      setSectionsList(secs);
      const uniqueClasses = Array.from(new Set(secs.map(s => s.classGrade)));
      setClassesList(uniqueClasses as string[]);
    };
    fetchDropdowns();
  }, []);

  // 🔍 Fetch Students & Existing Attendance
  const handleFetchStudents = async () => {
    if (!selectedClass || !selectedSection) return alert("Please select Class and Section.");
    
    setLoading(true);
    setStudents([]);
    setAttendanceData({});
    setSuccess(false);

    try {
      // 1. Fetch Students
      const q = query(
        collection(db, "students"), 
        where("classGrade", "==", selectedClass),
        where("section", "==", selectedSection)
      );
      const studentSnap = await getDocs(q);
      const studentList = studentSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(studentList.sort((a: any, b: any) => a.rollNumber - b.rollNumber));

      // 2. Fetch Today's Attendance (if already marked)
      const attQ = query(
        collection(db, "attendance"),
        where("classGrade", "==", selectedClass),
        where("section", "==", selectedSection),
        where("date", "==", selectedDate)
      );
      const attSnap = await getDocs(attQ);
      
      const existingData: Record<string, string> = {};
      attSnap.forEach(doc => {
        const data = doc.data();
        existingData[data.studentId] = data.status;
      });

      // 3. Merge: Default to 'Present' if not marked yet
      const mergedData: Record<string, string> = {};
      studentList.forEach(s => {
        mergedData[s.id] = existingData[s.id] || "Present"; // Default is Present
      });
      setAttendanceData(mergedData);

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  // 💾 Save Attendance (Using Firestore Batch for speed)
  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    setSaving(true);
    setSuccess(false);

    try {
      const batch = writeBatch(db);

      students.forEach(student => {
        // Unique ID per student per day prevents duplicates
        const docId = `${student.id}_${selectedDate}`;
        const attRef = doc(db, "attendance", docId);
        
        batch.set(attRef, {
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          classGrade: selectedClass,
          section: selectedSection,
          date: selectedDate,
          status: attendanceData[student.id],
          timestamp: new Date()
        });
      });

      await batch.commit();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: string) => {
    const updated: Record<string, string> = {};
    students.forEach(s => updated[s.id] = status);
    setAttendanceData(updated);
  };

  if (!isMounted) return null;

  const presentCount = Object.values(attendanceData).filter(s => s === "Present").length;
  const absentCount = Object.values(attendanceData).filter(s => s === "Absent").length;
  const leaveCount = Object.values(attendanceData).filter(s => s === "Leave").length;

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full">
      
      {/* 🚀 HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
            <ClipboardCheck className="text-blue-500" size={28}/> Daily Attendance
          </h1>
          <p className="text-sm text-slate-500 mt-1">Mark and manage student attendance quickly.</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold uppercase animate-fade-in-down w-full shadow-sm">
          <CheckCircle2 size={20}/> Attendance Saved Successfully!
        </div>
      )}

      {/* 🔍 FILTER SECTION */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 w-full">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end w-full">
            <div className="space-y-1 w-full">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Date</label>
               <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-blue-500" />
            </div>
            <div className="space-y-1 w-full">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class</label>
               <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-blue-500 uppercase">
                  <option value="">CHOOSE CLASS</option>
                  {classesList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
               </select>
            </div>
            <div className="space-y-1 w-full">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section</label>
               <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-blue-500 disabled:opacity-50 uppercase">
                  <option value="">CHOOSE SECTION</option>
                  {sectionsList.filter(s => norm(s.classGrade) === norm(selectedClass)).map(sec => (
                     <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>
                  ))}
               </select>
            </div>
            <button onClick={handleFetchStudents} disabled={loading || !selectedClass || !selectedSection} className="bg-[#0F172A] text-white w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 uppercase tracking-widest">
               {loading ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>} Fetch Students
            </button>
         </div>
      </div>

      {/* 📝 ATTENDANCE SHEET */}
      {students.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 animate-fade-in-up w-full">
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-6 w-full">
              <div>
                 <h2 className="text-xl font-black text-[#0F172A] uppercase">{selectedClass} - {selectedSection}</h2>
                 <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-1"><Calendar size={14}/> {new Date(selectedDate).toDateString()}</p>
              </div>
              
              {/* Quick Actions & Stats */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                 <div className="flex gap-2 text-xs font-black uppercase tracking-widest bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="text-green-600 px-2">P: {presentCount}</span>
                    <span className="text-red-600 border-l border-r border-slate-200 px-2">A: {absentCount}</span>
                    <span className="text-blue-600 px-2">L: {leaveCount}</span>
                 </div>
                 
                 <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => markAll("Present")} className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-black uppercase hover:bg-green-200">Mark All P</button>
                    <button onClick={() => markAll("Absent")} className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-black uppercase hover:bg-red-200">Mark All A</button>
                 </div>
              </div>
           </div>

           <div className="space-y-3 w-full">
              {students.map((student) => (
                 <div key={student.id} className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:border-blue-200 transition-colors w-full gap-4">
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-slate-400 border border-slate-200 shrink-0">
                          {student.rollNumber}
                       </div>
                       <div>
                          <p className="font-black text-[#0F172A] uppercase">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{student.fatherName}</p>
                       </div>
                    </div>

                    {/* Radio Buttons / Segmented Control */}
                    <div className="flex bg-white rounded-xl border border-slate-200 p-1 w-full sm:w-auto">
                       <button 
                         onClick={() => setAttendanceData(prev => ({...prev, [student.id]: "Present"}))}
                         className={`flex-1 sm:w-24 py-2 text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 transition-all ${attendanceData[student.id] === "Present" ? "bg-green-500 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50"}`}
                       >
                         <CheckCircle2 size={14} className={attendanceData[student.id] === "Present" ? "text-white" : "hidden"}/> P
                       </button>
                       <button 
                         onClick={() => setAttendanceData(prev => ({...prev, [student.id]: "Absent"}))}
                         className={`flex-1 sm:w-24 py-2 text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 transition-all ${attendanceData[student.id] === "Absent" ? "bg-red-500 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50"}`}
                       >
                         <XCircle size={14} className={attendanceData[student.id] === "Absent" ? "text-white" : "hidden"}/> A
                       </button>
                       <button 
                         onClick={() => setAttendanceData(prev => ({...prev, [student.id]: "Leave"}))}
                         className={`flex-1 sm:w-24 py-2 text-xs font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 transition-all ${attendanceData[student.id] === "Leave" ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:bg-slate-50"}`}
                       >
                         <Clock size={14} className={attendanceData[student.id] === "Leave" ? "text-white" : "hidden"}/> L
                       </button>
                    </div>

                 </div>
              ))}
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end w-full">
              <button 
                onClick={handleSaveAttendance} 
                disabled={saving}
                className="bg-[#3ac47d] text-white px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#2eaa6a] transition-all shadow-lg disabled:opacity-50 w-full sm:w-auto uppercase tracking-widest"
              >
                 {saving ? <><Loader2 size={18} className="animate-spin"/> Saving...</> : <><Save size={18}/> Submit Attendance</>}
              </button>
           </div>
           
        </div>
      )}

      {/* No Data State */}
      {selectedClass && selectedSection && students.length === 0 && !loading && (
         <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center w-full">
            <Users size={48} className="text-slate-300 mx-auto mb-4"/>
            <h3 className="font-black text-[#0F172A] text-lg uppercase">No Students Found</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">There are no students registered in {selectedClass} - {selectedSection}.</p>
         </div>
      )}

    </div>
  );
}
