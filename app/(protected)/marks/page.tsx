/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { PenTool, Save, CheckCircle2, AlertCircle, Users, BookOpen, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useSettings } from "@/hooks/useSettings";
import { useMarks, useSaveMarks } from "@/hooks/useExams";
import { useToast } from "@/components/ToastProvider";

const EXAM_TERMS = ["1st Term", "2nd Term", "Final Exams"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function ExamsAndMarksPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [selectedTerm, setSelectedTerm] = useState(EXAM_TERMS[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [globalTotalMarks, setGlobalTotalMarks] = useState("100");
  const [marksEntry, setMarksEntry] = useState<Record<string, { obtained: string, total: string }>>({});
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: classesData = [] } = useClasses();
  const availableClasses = useMemo(() => Array.from(new Set(classesData.map((c: any) => c.classGrade))), [classesData]);
  const availableSections = useMemo(() => classesData.filter((c: any) => c.classGrade === selectedClass).map((c: any) => c.sectionName || c.section), [classesData, selectedClass]);
  
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];

  // یہ هوک سٹوڈنٹس کو Live Fetch کرے گا جب کلاس اور سیکشن سلیکٹ ہوں گے
  const { data: studentsData = [], isLoading: loadingStudents } = useStudents(
    selectedClass && selectedSection ? { classGrade: selectedClass, section: selectedSection } : undefined
  );

  const { data: allMarks = [], isLoading: loadingMarks } = useMarks(selectedClass, selectedSection, selectedTerm, selectedSubject);
  const saveMarkMutation = useSaveMarks();

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

  const getInputValue = (studentId: string, field: "obtained" | "total") => {
    if (marksEntry[studentId] && marksEntry[studentId][field] !== undefined) return marksEntry[studentId][field];
    const existing = allMarks.find((m: any) => m.studentId === studentId && norm(m.term) === norm(selectedTerm) && norm(m.subject) === norm(selectedSubject));
    if (existing) return field === 'obtained' ? existing.marksObtained.toString() : existing.totalMarks.toString();
    return field === 'obtained' ? "" : globalTotalMarks;
  };

  const handleMarkChange = (studentId: string, field: "obtained" | "total", value: string) => {
    setMarksEntry(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value, total: field === "total" ? value : (prev[studentId]?.total || getInputValue(studentId, 'total')) } }));
  };

  const handleSaveSingleRecord = async (student: any) => {
    setSavingRow(student.id);
    setErrorMsg("");
    try {
      const obtainedNum = Number(getInputValue(student.id, "obtained"));
      const totalNum = Number(getInputValue(student.id, "total"));
      if (obtainedNum > totalNum) {
        setErrorMsg("Obtained marks cannot be greater than total marks.");
        return;
      }
      const percentage = totalNum > 0 ? ((obtainedNum / totalNum) * 100).toFixed(1) : "0";
      const grade = calculateGrade(obtainedNum, totalNum);
      
      await saveMarkMutation.mutateAsync({
        studentId: student.id, studentName: student.name || student.fullName,
        classGrade: selectedClass, section: selectedSection, term: selectedTerm, subject: selectedSubject,
        marksObtained: obtainedNum, totalMarks: totalNum, percentage: Number(percentage), grade: grade,
      });
      showToast("Marks saved successfully!", "success");
    } catch (err) {
      setErrorMsg("Failed to save mark.");
    } finally {
      setSavingRow(null);
    }
  };

  const isLoading = loadingStudents || (loadingMarks && !!selectedClass);

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <PenTool className="text-[#3ac47d]"/> Exams & Marks Entry
          </h1>
          <p className="text-sm text-slate-500 mt-1">Select Class & Section to load students automatically.</p>
        </div>
      </div>

      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-bold"><AlertCircle size={20}/> {errorMsg}</div>}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4">
        <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
          {EXAM_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
        </select>
        <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); setSelectedSubject(""); }} className="bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
          <option value="">Select Class</option>
          {availableClasses.map((cls: string) => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <select value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setSelectedSubject(""); }} disabled={!selectedClass} className="bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] disabled:opacity-50">
          <option value="">Select Section</option>
          {availableSections.map((sec: string) => <option key={sec} value={sec}>{sec}</option>)}
        </select>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedSection} className="bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-200 font-bold text-green-700 disabled:opacity-50">
          <option value="">Select Subject</option>
          {subjects.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
        </select>
        <input type="number" value={globalTotalMarks} onChange={e => setGlobalTotalMarks(e.target.value)} placeholder="Total Marks" className="bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="h-[300px] flex flex-col items-center justify-center opacity-40"><Loader2 size={40} className="mb-4 text-slate-400 animate-spin" /></div>
        ) : (!selectedClass || !selectedSection || !selectedSubject) ? (
          <div className="h-[300px] flex flex-col items-center justify-center opacity-40"><BookOpen size={60} className="mb-4 text-slate-400" /><h3 className="text-xl font-black text-slate-600">Select Criteria to Load Entry Grid</h3></div>
        ) : filteredStudents.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center opacity-40"><Users size={60} className="mb-4 text-slate-400" /><h3 className="text-xl font-black text-slate-600">No Students in this Section</h3></div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="px-6 py-3 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <div className="col-span-1">Roll</div><div className="col-span-4">Student Name</div><div className="col-span-2 text-center">Total</div><div className="col-span-2 text-center">Obtained</div><div className="col-span-3 text-right">Action</div>
            </div>
            {filteredStudents.sort((a: any, b: any) => (a.rollNumber||0) - (b.rollNumber||0)).map((student: any) => {
              const obtainedStr = getInputValue(student.id, "obtained");
              const totalStr = getInputValue(student.id, "total");
              const grade = calculateGrade(Number(obtainedStr), Number(totalStr));
              const isSavedInDB = allMarks.some((m: any) => m.studentId === student.id && norm(m.term) === norm(selectedTerm) && norm(m.subject) === norm(selectedSubject));
              return (
                <div key={student.id} className={`px-6 py-3 grid grid-cols-12 gap-4 items-center transition-colors ${isSavedInDB ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50'}`}>
                  <div className="col-span-1 font-black text-slate-400 text-lg">{student.rollNumber || "-"}</div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden shrink-0">
                      {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Users size={14}/></div>}
                    </div>
                    <div><p className="font-bold text-slate-800 text-sm">{student.name || student.fullName}</p><p className="text-[10px] text-slate-400 uppercase">{student.fatherName}</p></div>
                  </div>
                  <div className="col-span-2 flex justify-center"><input type="number" value={totalStr} onChange={(e) => handleMarkChange(student.id, "total", e.target.value)} className="w-16 bg-slate-100 text-center rounded-lg py-2 text-sm font-bold border border-transparent focus:border-blue-400 outline-none" /></div>
                  <div className="col-span-2 flex justify-center"><input type="number" placeholder="0" value={obtainedStr} onChange={(e) => handleMarkChange(student.id, "obtained", e.target.value)} className="w-20 bg-white text-center rounded-lg py-2 text-sm font-black border-2 border-slate-200 focus:border-[#3ac47d] outline-none" /></div>
                  <div className="col-span-3 flex justify-end items-center gap-3">
                    <span className={`w-8 text-center py-1 rounded-md text-xs font-black ${grade === 'U' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{grade}</span>
                    <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
                      <button onClick={() => handleSaveSingleRecord(student)} disabled={savingRow === student.id || saveMarkMutation.isPending} className="bg-slate-200 hover:bg-[#3ac47d] hover:text-gray-900 text-slate-600 p-2 rounded-lg transition-colors">
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
    </div>
  );
}
