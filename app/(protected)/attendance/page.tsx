"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, Users, CheckCircle2, XCircle, Loader2, 
  AlertCircle, Save, Clock, BookOpen 
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// API Helpers
const fetchClasses = async () => {
  const res = await fetch("/api/classes");
  if (!res.ok) throw new Error("Failed to fetch classes");
  const json = await res.json();
  return json.data || [];
};

const fetchStudents = async (classGrade: string, section: string) => {
  const res = await fetch(`/api/students?classGrade=${classGrade}&section=${section}`);
  if (!res.ok) throw new Error("Failed to fetch students");
  const json = await res.json();
  return json.data || [];
};

const fetchAttendance = async (params: Record<string, string>) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/attendance?${q}`);
  if (!res.ok) throw new Error("Failed to fetch attendance");
  const json = await res.json();
  return json.data || [];
};

const saveAttendanceApi = async (data: any) => {
  const res = await fetch("/api/attendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save attendance");
  return res.json();
};

export default function AttendancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Fetch Real Classes
  const { data: classesData = [], isLoading: loadingClasses } = useQuery({
    queryKey: ["classes", user?.tenantId],
    queryFn: fetchClasses,
    enabled: !!user?.tenantId,
  });

  // Extract unique classes (e.g., "10", "9")
  const availableClasses = useMemo(() => {
    return Array.from(new Set(classesData.map((c: any) => c.classGrade)));
  }, [classesData]);

  // Extract sections based on selected class
  const availableSections = useMemo(() => {
    if (!selectedClass) return [];
    return classesData.filter((c: any) => c.classGrade === selectedClass).map((c: any) => c.sectionName || c.section);
  }, [classesData, selectedClass]);

  // 2. Fetch Real Students based on Class & Section
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students", user?.tenantId, selectedClass, selectedSection],
    queryFn: () => fetchStudents(selectedClass, selectedSection),
    enabled: !!user?.tenantId && !!selectedClass && !!selectedSection,
  });

  // 3. Fetch Existing Attendance for the day
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance", user?.tenantId, selectedClass, selectedSection, selectedDate],
    queryFn: () => fetchAttendance({ classGrade: selectedClass, section: selectedSection, date: selectedDate }),
    enabled: !!user?.tenantId && !!selectedClass && !!selectedSection,
  });

  const saveMutation = useMutation({
    mutationFn: saveAttendanceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", user?.tenantId, selectedClass, selectedSection, selectedDate] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSaveAll = async () => {
    if (students.length === 0) return;
    setSaving(true);
    try {
      const promises = students.map((student: any) => {
        const status = entries[student.id] || "Absent";
        return saveMutation.mutateAsync({
          studentId: student.id,
          studentName: student.fullName || student.name,
          classGrade: selectedClass,
          section: selectedSection,
          date: selectedDate,
          status,
        });
      });
      await Promise.all(promises);
    } finally {
      setSaving(false);
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
          <p className="text-sm text-gray-500 mt-1">Mark and track student presence securely.</p>
        </div>
        
        <RequirePermission permissions={[PERMISSIONS.attendance.mark]}>
          <button 
            onClick={handleSaveAll} 
            disabled={saving || saveMutation.isPending || students.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {saving || saveMutation.isPending ? <Loader2 className="animate-spin"/> : <Save size={18}/>} 
            Save All
          </button>
        </RequirePermission>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 font-bold border border-green-100"><CheckCircle2 size={18}/> Attendance saved successfully!</div>}

      {/* FILTERS - Now 100% Dynamic */}
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
          disabled={loadingClasses}
        >
          <option value="">{loadingClasses ? "Loading Classes..." : "Select Class"}</option>
          {availableClasses.map((cls: string) => <option key={cls} value={cls}>Class {cls}</option>)}
        </select>

        <select 
          value={selectedSection} 
          onChange={e => setSelectedSection(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 font-medium"
          disabled={!selectedClass}
        >
          <option value="">Select Section</option>
          {availableSections.map((sec: string) => <option key={sec} value={sec}>Section {sec}</option>)}
        </select>
      </div>

      {/* STUDENTS LIST - Now Fetches Real DB Data */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
          <Users size={18/> Students
        </div>
        
        {loadingStudents ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
        ) : !selectedClass || !selectedSection ? (
          <div className="p-8 text-center text-gray-400 font-bold flex flex-col items-center gap-2">
            <BookOpen size={32} />
            Select Class & Section to load students.
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-bold">
            No students found in Class {selectedClass} - Section {selectedSection}.
            <br/>
            <span className="text-xs">Please add students to this section first.</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student: any) => {
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
