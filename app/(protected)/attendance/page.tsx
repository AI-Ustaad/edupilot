"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Users, CheckCircle2, XCircle, Loader2, Save, Clock, BookOpen, RotateCcw } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";

// 🚀 Layered Architecture Hooks
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useRealtimeAttendance } from "@/hooks/useRealtimeAttendance"; // Live Hook
import { useAttendance, useSaveAttendance } from "@/hooks/useAttendance"; // Save Mutation & Server Query
import { useToast } from "@/components/ToastProvider";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";

export default function AttendancePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());
  });
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [entries, setEntries] = useState<Record<string, string>>({});

  // 1. Fetch Live Classes
  const { data: classesData = [] } = useClasses();
  const availableClasses = useMemo(() => Array.from(new Set(classesData.map((c: any) => c.classGrade).filter(Boolean))), [classesData]);
  const availableSections = useMemo(() => classesData.filter((c: any) => c.classGrade === selectedClass).map((c: any) => c.sectionName || c.section), [classesData, selectedClass]);

  // 2. Fetch Live Students (Filtered by Class & Section)
  const { data: rawStudents = [], isLoading: loadingStudents } = useStudents(
    selectedClass && selectedSection ? { classGrade: selectedClass, section: selectedSection } : undefined
  );

  // Numeric roll number sorting: 1, 2, ..., 9, 10 (never 1, 10, 2)
  const students = useMemo(() => {
    return [...rawStudents].sort((a: any, b: any) => {
      const numA = Number(String(a.rollNumber || "").replace(/\D/g, "")) || 0;
      const numB = Number(String(b.rollNumber || "").replace(/\D/g, "")) || 0;
      if (numA !== numB) return numA - numB;
      return (a.fullName || a.name || "").localeCompare(b.fullName || b.name || "");
    });
  }, [rawStudents]);

  // 3. Fetch Attendance (both realtime listener and direct server query)
  const { data: realtimeRecords = [], isLoading: loadingRealtime } = useRealtimeAttendance(selectedClass, selectedSection, selectedDate);
  const { data: apiRecords = [], isLoading: loadingApi } = useAttendance(selectedClass, selectedSection, selectedDate);

  const attendanceRecords = useMemo(() => {
    return realtimeRecords.length > 0 ? realtimeRecords : apiRecords;
  }, [realtimeRecords, apiRecords]);

  // 4. Save Mutation
  const saveMutation = useSaveAttendance();

  const handleMarkStatus = async (student: any, status: "Present" | "Absent" | "Late") => {
    setEntries(p => ({ ...p, [student.id]: status }));
    try {
      await saveMutation.mutateAsync({
        studentId: student.id,
        studentName: student.fullName || student.name,
        classGrade: selectedClass,
        section: selectedSection,
        date: selectedDate,
        status,
      });
      showToast(`${student.fullName || student.name} marked ${status}`, "success");
    } catch {
      // Non-fatal, handleSaveAll is also available
    }
  };

  const handleClearStatus = async (student: any) => {
    setEntries(p => {
      const copy = { ...p };
      delete copy[student.id];
      return copy;
    });
    try {
      await apiClient.delete(`/attendance?studentId=${student.id}&date=${selectedDate}`);
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
      showToast(`${student.fullName || student.name} unmarked`, "info");
    } catch {
      showToast("Failed to clear attendance mark.", "error");
    }
  };

  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let unmarked = 0;

    students.forEach((s: any) => {
      const existing = attendanceRecords.find((a: any) => a.studentId === s.id);
      const rawStatus = entries[s.id] || existing?.status;
      if (!rawStatus || String(rawStatus).toLowerCase() === "not marked") {
        unmarked++;
      } else {
        const str = String(rawStatus).toLowerCase();
        if (str === "present") present++;
        else if (str === "absent") absent++;
        else if (str === "late") late++;
        else if (str === "leave") leave++;
        else present++;
      }
    });

    const marked = present + absent + late + leave;
    return { present, absent, late, leave, unmarked, marked, total: students.length };
  }, [students, entries, attendanceRecords]);

  const handleMarkRemainingPresent = async () => {
    const unmarkedStudents = students.filter((student: any) => {
      const existing = attendanceRecords.find((a: any) => a.studentId === student.id);
      const rawStatus = entries[student.id] || existing?.status;
      return !rawStatus || String(rawStatus).toLowerCase() === "not marked";
    });

    if (unmarkedStudents.length === 0) {
      showToast("All students are already marked.", "info");
      return;
    }

    try {
      const bulkData = unmarkedStudents.map((student: any) => ({
        studentId: student.id,
        studentName: student.fullName || student.name,
        classGrade: selectedClass,
        section: selectedSection,
        date: selectedDate,
        status: "Present" as const,
      }));

      const newEntries = { ...entries };
      unmarkedStudents.forEach((s: any) => {
        newEntries[s.id] = "Present";
      });
      setEntries(newEntries);

      await saveMutation.mutateAsync(bulkData);
      showToast(`Marked ${unmarkedStudents.length} remaining students as Present!`, "success");
    } catch {
      showToast("Failed to mark remaining students.", "error");
    }
  };

  const handleSaveAll = async () => {
    if (students.length === 0) return;
    try {
      const bulkData = students.map((student: any) => ({
        studentId: student.id,
        studentName: student.fullName || student.name,
        classGrade: selectedClass,
        section: selectedSection,
        date: selectedDate,
        status: (entries[student.id] || attendanceRecords.find((a: any) => a.studentId === student.id)?.status || "Absent") as "Present" | "Absent" | "Leave" | "Late" | "HalfDay" | "Holiday",
      }));
      await saveMutation.mutateAsync(bulkData);
      showToast("Attendance saved successfully!", "success");
    } catch {
      showToast("Failed to save attendance.", "error");
    }
  };

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-wrap justify-between items-end gap-4">
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
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border bg-emerald-50 text-emerald-700 border-emerald-200">
            {saveMutation.isPending ? (
              <>
                <Loader2 size={15} className="animate-spin text-emerald-600" />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Auto-saved live</span>
              </>
            )}
          </div>
          <button 
            onClick={handleMarkRemainingPresent} 
            disabled={saveMutation.isPending || students.length === 0 || attendanceStats.unmarked === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 transition text-xs"
            title="Mark all unmarked students as Present"
          >
            <CheckCircle2 size={14}/> 
            <span>Mark Remaining Present ({attendanceStats.unmarked})</span>
          </button>
        </div>
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
          {availableClasses.map((c: string) => (
            <option key={c} value={c}>{formatClassLabel(c)}</option>
          ))}
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

      {/* Explicit Summary Bar */}
      {selectedClass && selectedSection && students.length > 0 && (
        <div className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 text-sm font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {attendanceStats.marked}/{attendanceStats.total} marked
            </span>
            <span className="text-slate-400 font-normal">—</span>
            <span className="text-emerald-400">{attendanceStats.present} Present</span>
            <span className="text-slate-500">•</span>
            <span className="text-red-400">{attendanceStats.absent} Absent</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">{attendanceStats.late} Late</span>
            {attendanceStats.leave > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-blue-400">{attendanceStats.leave} Leave</span>
              </>
            )}
            {attendanceStats.unmarked > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-semibold">{attendanceStats.unmarked} Unmarked</span>
              </>
            )}
          </div>

          <div className="text-xs text-slate-300 font-semibold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            {formatClassLabel(selectedClass)} - Section {cleanSectionName(selectedSection)} • {selectedDate}
          </div>
        </div>
      )}

      {/* STUDENTS LIST - Live DB Data */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
          <Users size={18}/> Students
        </div>
        
        {loadingStudents || (loadingRealtime && loadingApi) ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
        ) : !selectedClass || !selectedSection ? (
          <div className="p-8 text-center text-gray-400 font-bold flex flex-col items-center gap-2">
            <BookOpen size={32} />
            Select Class & Section to load students.
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-bold">
            No students found in {formatClassLabel(selectedClass)} - Section {cleanSectionName(selectedSection)}.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student: any) => {
              const existing = attendanceRecords.find((a: any) => a.studentId === student.id);
              const rawStatus = entries[student.id] || existing?.status;
              let currentStatus = "Not Marked";
              if (rawStatus) {
                const s = String(rawStatus).toLowerCase();
                if (s === "present") currentStatus = "Present";
                else if (s === "absent") currentStatus = "Absent";
                else if (s === "late") currentStatus = "Late";
                else if (s === "leave") currentStatus = "Leave";
                else if (s === "halfday") currentStatus = "HalfDay";
                else if (s === "holiday") currentStatus = "Holiday";
                else currentStatus = rawStatus;
              }
              
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
                  <div className="flex items-center gap-2">
                    {currentStatus === "Not Marked" && (
                      <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2.5 py-1 rounded-lg">
                        Not Marked
                      </span>
                    )}
                    <button 
                      onClick={() => handleMarkStatus(student, "Present")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentStatus === "Present" ? "bg-green-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"}`}
                    >
                      <CheckCircle2 size={14} className="inline mr-1"/> Present
                    </button>
                    <button 
                      onClick={() => handleMarkStatus(student, "Absent")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentStatus === "Absent" ? "bg-red-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"}`}
                    >
                      <XCircle size={14} className="inline mr-1"/> Absent
                    </button>
                    <button 
                      onClick={() => handleMarkStatus(student, "Late")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentStatus === "Late" ? "bg-amber-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"}`}
                    >
                      <Clock size={14} className="inline mr-1"/> Late
                    </button>
                    {currentStatus !== "Not Marked" && (
                      <button
                        onClick={() => handleClearStatus(student)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-gray-100 transition flex items-center gap-1"
                        title="Clear mark"
                      >
                        <RotateCcw size={12} /> Unmark
                      </button>
                    )}
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
