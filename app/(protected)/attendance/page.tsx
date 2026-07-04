"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Users, CheckCircle2, XCircle, Loader2, Save, Clock, BookOpen } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🚀 Layered Architecture Hooks
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useRealtimeAttendance } from "@/hooks/useRealtimeAttendance"; // Live Hook
import { useSaveAttendance } from "@/hooks/useAttendance"; // Save Mutation
import { useToast } from "@/components/ToastProvider";

export default function AttendancePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [entries, setEntries] = useState<Record<string, string>>({});

  // 1. Fetch Live Classes
  const { data: classesData = [] } = useClasses();
  const availableClasses = useMemo(() => Array.from(new Set(classesData.map((c: any) => c.classGrade))), [classesData]);
  const availableSections = useMemo(() => classesData.filter((c: any) => c.classGrade === selectedClass).map((c: any) => c.sectionName || c.section), [classesData, selectedClass]);

  // 2. Fetch Live Students (Filtered by Class & Section)
  const { data: students = [], isLoading: loadingStudents } = useStudents(
    selectedClass && selectedSection ? { classGrade: selectedClass, section: selectedSection } : undefined
  );

  // 3. 🚀 Fetch REAL-TIME Attendance for the day
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useRealtimeAttendance(selectedClass, selectedSection, selectedDate);

  // 4. Save Mutation
  const saveMutation = useSaveAttendance();

  const handleSaveAll = async () => {
    if (students.length === 0) return;
    try {
      await Promise.all(students.map((student: any) => {
        const status = entries[student.id] || "Absent";
        return saveMutation.mutateAsync({
          studentId: student.id,
          studentName: student.fullName || student.name,
          classGrade: selectedClass,
          section: selectedSection,
          date: selectedDate,
          status,
        });
      }));
      showToast("Attendance saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save attendance.", "error");
    }
  };

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Calendar className="text-blue-600"/> Daily Attendance
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live attendance updates enabled.
          </p>
        </div>
        
        <RequirePermission permissions={[PERMISSIONS.attendance.mark]}>
          <button 
            onClick={handleSaveAll} 
            disabled={saveMutation.isPending || students.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin"/> : <Save size={18}/>} 
            Save All
          </button>
        </RequirePermission>
      </div>

      {/* FILTERS - 100% Dynamic */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <input 
          type="date" 
          value={selectedDate} 
          onChange={e => setSelectedDate(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 font-medium" 
        />
        <select 
          value={selectedClass} 
          onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} 
          className="border border-gray-300 rounded-lg px-3 py-2 font-medium"
        >
          <option value="">Select Class</option>
          {availableClasses.map((c: string) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select 
          value={selectedSection} 
          onChange={e => setSelectedSection(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 font-medium"
          disabled={!selectedClass}
        >
          <option value="">Select Section</option>
          {availableSections.map((s: string) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* STUDENTS LIST - Live DB Data */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
          <Users size={18}/> Students
        </div>
        
        {loadingStudents || loadingAttendance ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
        ) : !selectedClass || !selectedSection ? (
          <div className="p-8 text-center text-gray-400 font-bold flex flex-col items-center gap-2">
            <BookOpen size={32} />
            Select Class & Section to load students.
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-bold">
            No students found in Class {selectedClass} - Section {selectedSection}.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student: any) => {
              // 🚀 Real-time status check
              const existing = attendanceRecords.find((a: any) => a.studentId === student.id);
              const currentStatus = entries[student.id] || existing?.status || "Absent";
              
              return (
                <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                      {student.rollNumber || "—"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{student.fullName || student.name}</p>
                      <p className="text-xs text-gray-400 uppercase">Roll #{student.rollNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEntries(p => ({...p, [student.id]: "Present"}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentStatus === "Present" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"}`}
                    >
                      <CheckCircle2 size={14} className="inline mr-1"/> Present
                    </button>
                    <button 
                      onClick={() => setEntries(p => ({...p, [student.id]: "Absent"}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentStatus === "Absent" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"}`}
                    >
                      <XCircle size={14} className="inline mr-1"/> Absent
                    </button>
                    <button 
                      onClick={() => setEntries(p => ({...p, [student.id]: "Late"}))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentStatus === "Late" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"}`}
                    >
                      <Clock size={14} className="inline mr-1"/> Late
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
