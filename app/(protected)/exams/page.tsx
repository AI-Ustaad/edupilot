/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  PenTool, Save, CheckCircle2, AlertCircle, 
  Users, BookOpen, Trash2, Database, Loader2 
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

const EXAM_TERMS = ["1st Term", "2nd Term", "Final Exams", "Monthly Test", "Mock Exams", "SBA"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

// --- API Helper Functions ---
const fetchStudents = async () => {
  const res = await fetch("/api/students");
  if (!res.ok) throw new Error("Failed to fetch students");
  const json = await res.json();
  return json.success ? json.data : json;
};

const fetchSections = async () => {
  const res = await fetch("/api/classes"); 
  if (!res.ok) throw new Error("Failed to fetch sections");
  const json = await res.json();
  return json.success ? json.data : json;
};

const fetchMarks = async ({ classGrade, section, term, subject }: any) => {
  const params = new URLSearchParams();
  if (classGrade) params.append("classGrade", classGrade);
  if (section) params.append("section", section);
  if (term) params.append("term", term);
  if (subject) params.append("subject", subject);
  
  const res = await fetch(`/api/marks?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch marks");
  const json = await res.json();
  return json.success ? json.data : [];
};

const saveMarkApi = async (markData: any) => {
  const res = await fetch("/api/marks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(markData),
  });
  if (!res.ok) throw new Error("Failed to save mark");
  return res.json();
};

const deleteMarkApi = async (markId: string) => {
  const res = await fetch(`/api/marks?id=${markId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete mark");
  return res.json();
};

export default function ExamsAndMarksPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTerm, setSelectedTerm] = useState(EXAM_TERMS[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [globalTotalMarks, setGlobalTotalMarks] = useState("100");
  const [marksEntry, setMarksEntry] = useState<Record<string, { obtained: string, total: string }>>({});
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // 1. Fetch Students via React Query
  const { data: studentsData = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students", user?.tenantId],
    queryFn: fetchStudents,
    enabled: !!user?.tenantId,
  });

  // 2. Fetch Sections/Classes via React Query
  const { data: sectionsData = [], isLoading: loadingSections } = useQuery({
    queryKey: ["sections", user?.tenantId],
    queryFn: fetchSections,
    enabled: !!user?.tenantId,
  });

  // 3. Fetch Marks (only when filters are selected)
  const { data: allMarks = [], isLoading: loadingMarks } = useQuery({
    queryKey: ["marks", user?.tenantId, selectedClass, selectedSection, selectedTerm, selectedSubject],
    queryFn: () => fetchMarks({ classGrade: selectedClass, section: selectedSection, term: selectedTerm, subject: selectedSubject }),
    enabled: !!user?.tenantId && !!selectedClass && !!selectedSection && !!selectedSubject,
  });

  // Reset local marks entry when filters change
  useEffect(() => {
    setMarksEntry({});
  }, [selectedTerm, selectedClass, selectedSection, selectedSubject]);

  // Mutations for Saving and Deleting
  const saveMarkMutation = useMutation({
    mutationFn: saveMarkApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks", user?.tenantId, selectedClass, selectedSection, selectedTerm, selectedSubject] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: () => {
      setErrorMsg("Failed to save mark.");
    }
  });

  const deleteMarkMutation = useMutation({
    mutationFn: deleteMarkApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks", user?.tenantId, selectedClass, selectedSection, selectedTerm, selectedSubject] });
    },
    onError: () => {
      setErrorMsg("Failed to delete mark.");
    }
  });

  const availableClasses = Array.from(new Set(sectionsData.map((s: any) => s.classGrade || s.name)));
  const availableSections = sectionsData.filter((s: any) => norm(s.classGrade || s.name) === norm(selectedClass));
  const activeSectionData = sectionsData.find((s: any) => norm(s.classGrade || s.name) === norm(selectedClass) && norm(s.sectionName || s.section) === norm(selectedSection));
  const availableSubjects = activeSectionData?.subjects ? [...(activeSectionData.subjects.core || []), ...(activeSectionData.subjects.electives || [])] : [];
  
  const filteredStudents = studentsData.filter((s: any) => 
    norm(s.classGrade) === norm(selectedClass) && norm(s.section) === norm(selectedSection)
  );

  const calculateGrade = (obtained: number, total: number) => {
    if (!total || !obtained || total === 0) return "-";
    const percent = (obtained / total) * 100;
    if (percent >= 90) return "A++";
    if (percent >= 80) return "A+";
    if (percent >= 70) return "A";
    if (percent >= 60) return "B";
    if (percent >= 50) return "C";
    if (percent >= 40) return "D"; 
    return "U";
  };

  const handleMarkChange = (studentId: string, field: "obtained" | "total", value: string) => {
    setMarksEntry(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        total: field === "total" ? value : (prev[studentId]?.total || getInputValue(studentId, 'total'))
      }
    }));
  };

  const getInputValue = (studentId: string, field: "obtained" | "total") => {
    if (marksEntry[studentId] && marksEntry[studentId][field] !== undefined) {
      return marksEntry[studentId][field];
    }
    const existing = allMarks.find((m: any) => m.studentId === studentId && norm(m.term) === norm(selectedTerm) && norm(m.subject) === norm(selectedSubject));
    if (existing) {
      return field === 'obtained' ? existing.marksObtained.toString() : existing.totalMarks.toString();
    }
    return field === 'obtained' ? "" : globalTotalMarks;
  };

  const handleSaveSingleRecord = async (student: any) => {
    setSavingRow(student.id);
    setErrorMsg("");
    try {
      const obtainedNum = Number(getInputValue(student.id, "obtained"));
      const totalNum = Number(getInputValue(student.id, "total"));
      const percentage = totalNum > 0 ? ((obtainedNum / totalNum) * 100).toFixed(1) : "0";
      const grade = calculateGrade(obtainedNum, totalNum);
      
      await saveMarkMutation.mutateAsync({
        studentId: student.id,
        studentName: student.name || student.fullName,
        classGrade: selectedClass,
        section: selectedSection,
        term: selectedTerm,
        subject: selectedSubject,
        marksObtained: obtainedNum,
        totalMarks: totalNum,
        percentage: Number(percentage),
        grade: grade,
      });
    } finally {
      setSavingRow(null);
    }
  };

  const handleBulkSave = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject) {
      return setErrorMsg("Select Class, Section, and Subject.");
    }
    setErrorMsg("");
    try {
      const promises = filteredStudents.map((student: any) => {
        const obtainedNum = Number(getInputValue(student.id, "obtained"));
        const totalNum = Number(getInputValue(student.id, "total"));
        const percentage = totalNum > 0 ? ((obtainedNum / totalNum) * 100).toFixed(1) : "0";
        const grade = calculateGrade(obtainedNum, totalNum);
        
        return saveMarkMutation.mutateAsync({
          studentId: student.id,
          studentName: student.name || student.fullName,
          classGrade: selectedClass,
          section: selectedSection,
          term: selectedTerm,
          subject: selectedSubject,
          marksObtained: obtainedNum,
          totalMarks: totalNum,
          percentage: Number(percentage),
          grade: grade,
        });
      });
      await Promise.all(promises);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg("Failed to bulk save marks.");
    }
  };

  const handleDeleteMark = async (markId: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deleteMarkMutation.mutate(markId);
    }
  };

  const isLoading = loadingStudents || loadingSections || (loadingMarks && !!selectedClass);

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <PenTool className="text-[#3ac47d]"/> Exams & Marks Entry
          </h1>
          <p className="text-sm text-slate-500 mt-1">Smart Assessment Engine linked directly to Results Module.</p>
        </div>
        
        {/* 🛡️ Protected Publish Button */}
        <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
          <button 
            onClick={handleBulkSave} 
            disabled={isLoading || filteredStudents.length === 0 || !selectedSubject || saveMarkMutation.isPending} 
            className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {saveMarkMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
            {saveMarkMutation.isPending ? "Publishing..." : "Publish All Results"}
          </button>
        </RequirePermission>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Marks saved successfully!</div>}
      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-bold"><AlertCircle size={20}/> {errorMsg}</div>}

      {/* FILTER PANEL */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap gap-4 items-end z-10 relative">
        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
            {EXAM_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
          </select>
        </div>
        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Class</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); setSelectedSubject(""); }} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
            <option value="">-- Choose --</option>
            {availableClasses.map((cls: any) => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>
        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Section</label>
          <select value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setSelectedSubject(""); }} disabled={!selectedClass} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] disabled:opacity-50">
            <option value="">-- Choose --</option>
            {availableSections.map((sec: any) => <option key={sec.id} value={sec.sectionName || sec.section}>{sec.sectionName || sec.section}</option>)}
          </select>
        </div>
        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-[#3ac47d] uppercase tracking-widest">Select Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedSection} className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-200 font-bold text-green-700 disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400">
            <option value="">-- Choose --</option>
            {availableSubjects.map((sub: any) => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Default Total Marks</label>
          <input type="number" value={globalTotalMarks} onChange={e => setGlobalTotalMarks(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
      </div>

      {/* --- DATA ENTRY GRID --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="h-[300px] flex flex-col items-center justify-center opacity-40">
             <Loader2 size={40} className="mb-4 text-slate-400 animate-spin" />
             <h3 className="text-xl font-black text-slate-600">Loading Data...</h3>
          </div>
        ) : (!selectedClass || !selectedSection || !selectedSubject) ? (
          <div className="h-[300px] flex flex-col items-center justify-center opacity-40">
             <BookOpen size={60} className="mb-4 text-slate-400" />
             <h3 className="text-xl font-black text-slate-600">Select Criteria to Load Entry Grid</h3>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center opacity-40">
             <Users size={60} className="mb-4 text-slate-400" />
             <h3 className="text-xl font-black text-slate-600">No Students in this Section</h3>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="px-6 py-4 bg-[#0F172A] text-gray-900 flex items-center justify-between">
               <div>
                 <h2 className="text-lg font-black uppercase">{selectedClass} - {selectedSection}</h2>
                 <p className="text-xs text-slate-300 font-medium">Entering marks for: <span className="font-bold text-[#3ac47d] uppercase">{selectedSubject}</span></p>
               </div>
            </div>
            <div className="px-6 py-3 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <div className="col-span-1">Roll No</div>
              <div className="col-span-4">Student Name</div>
              <div className="col-span-2 text-center">Total Marks</div>
              <div className="col-span-2 text-center">Obtained</div>
              <div className="col-span-3 text-right">Result & Action</div>
            </div>
            {filteredStudents.sort((a: any, b: any) => (a.rollNumber||0) - (b.rollNumber||0)).map((student: any) => {
              const obtainedStr = getInputValue(student.id, "obtained");
              const totalStr = getInputValue(student.id, "total");
              const percent = totalStr && obtainedStr ? ((Number(obtainedStr) / Number(totalStr)) * 100).toFixed(1) : "0.0";
              const grade = calculateGrade(Number(obtainedStr), Number(totalStr));
              const isFail = grade === "U";
              const isSavedInDB = allMarks.some((m: any) => m.studentId === student.id && norm(m.term) === norm(selectedTerm) && norm(m.subject) === norm(selectedSubject));
              
              return (
                <div key={student.id} className={`px-6 py-3 grid grid-cols-12 gap-4 items-center transition-colors group ${isSavedInDB ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50'}`}>
                  <div className="col-span-1 font-black text-slate-400 text-lg">{student.rollNumber || "-"}</div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden shrink-0">
                      {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" alt={`${student.name || student.fullName}'s profile`} /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Users size={14}/></div>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {student.name || student.fullName}
                        {isSavedInDB && <span className="bg-blue-100 text-blue-600 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">Saved</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase">{student.fatherName}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <input type="number" value={totalStr} onChange={(e) => handleMarkChange(student.id, "total", e.target.value)} className="w-16 bg-slate-100 text-center rounded-lg py-2 text-sm font-bold border border-transparent focus:border-blue-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <input type="number" placeholder="0" value={obtainedStr} onChange={(e) => handleMarkChange(student.id, "obtained", e.target.value)} className="w-20 bg-white text-center rounded-lg py-2 text-sm font-black border-2 border-slate-200 focus:border-[#3ac47d] focus:bg-[#f0fdf4] outline-none shadow-inner transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div className="col-span-3 flex justify-end items-center gap-3">
                     <span className="text-xs font-bold text-slate-500">{percent}%</span>
                     <span className={`w-8 text-center py-1 rounded-md text-xs font-black ${isFail ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{grade}</span>
                     
                     {/* 🛡️ Protected Single Save Button */}
                     <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
                       <button onClick={() => handleSaveSingleRecord(student)} disabled={savingRow === student.id || saveMarkMutation.isPending} className="bg-slate-200 hover:bg-[#3ac47d] hover:text-gray-900 text-slate-600 p-2 rounded-lg transition-colors" title="Save this record">
                          {savingRow === student.id ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                       </button>
                     </RequirePermission>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- SAVED MARKS LEDGER --- */}
      {selectedClass && selectedSection && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8 animate-fade-in-up">
           <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <Database className="text-blue-500" size={20}/>
                 <h2 className="font-black text-slate-800">Live Database Ledger</h2>
              </div>
              <p className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-lg shadow-sm">
                 Showing all marks for <span className="text-blue-600 uppercase">{selectedClass} - {selectedSection} ({selectedTerm})</span>
              </p>
           </div>
           <div className="p-6">
              {allMarks.length === 0 ? (
                 <p className="text-center text-slate-400 font-bold py-10">No marks have been saved for this class and term yet.</p>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead>
                          <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest">
                             <th className="pb-3 font-bold">Student Name</th>
                             <th className="pb-3 font-bold">Subject</th>
                             <th className="pb-3 font-bold">Marks (Obt/Tot)</th>
                             <th className="pb-3 font-bold">%</th>
                             <th className="pb-3 font-bold">Grade</th>
                             <th className="pb-3 font-bold text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {allMarks.map((mark: any) => (
                             <tr key={mark.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 font-bold text-slate-800">{mark.studentName}</td>
                                <td className="py-3 font-bold text-[#3ac47d] uppercase">{mark.subject}</td>
                                <td className="py-3 font-black text-slate-600">{mark.marksObtained} / {mark.totalMarks}</td>
                                <td className="py-3 font-bold text-slate-500">{mark.percentage}%</td>
                                <td className="py-3 font-black">{mark.grade}</td>
                                <td className="py-3 text-right">
                                   {/* 🛡️ Protected Delete Button */}
                                   <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
                                      <button onClick={() => handleDeleteMark(mark.id)} disabled={deleteMarkMutation.isPending} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md transition-colors disabled:opacity-50" title="Delete Record">
                                         {deleteMarkMutation.isPending ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                                      </button>
                                   </RequirePermission>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
