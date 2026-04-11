"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PenTool, Search, Save, CheckCircle2, AlertCircle, Award, Users, BookOpen } from "lucide-react";

// Exam Categories based on your SBA structure
const EXAM_TERMS = ["1st Term", "2nd Term", "Final Exams", "Monthly Test", "Mock Exams", "SBA"];

export default function ExamsAndMarksPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Data States
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  
  // Selection States
  const [selectedTerm, setSelectedTerm] = useState(EXAM_TERMS[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Marks Entry State { studentId: { obtained: string, total: string } }
  const [marksEntry, setMarksEntry] = useState<Record<string, { obtained: string, total: string }>>({});
  const [globalTotalMarks, setGlobalTotalMarks] = useState("100");

  useEffect(() => {
    setIsMounted(true);
    // Fetch Sections (to get classes and subjects)
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snapshot) => {
      setSectionsData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Fetch All Students
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snapshot) => {
      setStudentsData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubSections(); unsubStudents(); };
  }, []);

  // Derived Data for Dropdowns
  const availableClasses = Array.from(new Set(sectionsData.map(s => s.classGrade)));
  const availableSections = sectionsData.filter(s => s.classGrade === selectedClass);
  const activeSectionData = sectionsData.find(s => s.classGrade === selectedClass && s.sectionName === selectedSection);
  
  // Combine Core and Elective subjects for the dropdown
  const availableSubjects = activeSectionData?.subjects 
    ? [...(activeSectionData.subjects.core || []), ...(activeSectionData.subjects.electives || [])] 
    : [];

  const filteredStudents = studentsData.filter(s => s.classGrade === selectedClass && s.section === selectedSection);

  // Auto-calculate Grade based on 40% passing criteria
  const calculateGrade = (obtained: number, total: number) => {
    if (!total || !obtained || total === 0) return "-";
    const percent = (obtained / total) * 100;
    if (percent >= 90) return "A++";
    if (percent >= 80) return "A+";
    if (percent >= 70) return "A";
    if (percent >= 60) return "B";
    if (percent >= 50) return "C";
    if (percent >= 40) return "D"; // Pass
    return "U"; // Fail
  };

  const handleMarkChange = (studentId: string, field: "obtained" | "total", value: string) => {
    setMarksEntry(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        total: field === "total" ? value : (prev[studentId]?.total || globalTotalMarks)
      }
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject) {
      return setErrorMsg("Please select Class, Section, and Subject.");
    }
    
    setLoading(true); setErrorMsg(""); setSuccess(false);
    
    try {
      // Save marks for each student in the grid
      const promises = filteredStudents.map(student => {
        const studentMarks = marksEntry[student.id] || { obtained: "0", total: globalTotalMarks };
        const obtainedNum = Number(studentMarks.obtained);
        const totalNum = Number(studentMarks.total);
        const percentage = totalNum > 0 ? ((obtainedNum / totalNum) * 100).toFixed(1) : "0";
        const grade = calculateGrade(obtainedNum, totalNum);

        // Document ID structure: studentId_term_subject
        const markDocId = `${student.id}_${selectedTerm.replace(/\s+/g, '')}_${selectedSubject.replace(/\s+/g, '')}`;
        
        return setDoc(doc(db, "marks", markDocId), {
          studentId: student.id,
          studentName: student.name,
          classGrade: selectedClass,
          section: selectedSection,
          term: selectedTerm,
          subject: selectedSubject,
          marksObtained: obtainedNum,
          totalMarks: totalNum,
          percentage: Number(percentage),
          grade: grade,
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

      await Promise.all(promises);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg("Failed to save marks. Check database rules.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <PenTool className="text-[#3ac47d]"/> Exams & Marks Entry
          </h1>
          <p className="text-sm text-slate-500 mt-1">Smart Assessment Engine for SBA and Term Exams.</p>
        </div>
        <button 
          onClick={handleSaveMarks} 
          disabled={loading || filteredStudents.length === 0} 
          className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : <><Save size={18}/> Publish Results</>}
        </button>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100"><CheckCircle2 size={20}/> Marks saved successfully!</div>}
      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100"><AlertCircle size={20}/> {errorMsg}</div>}

      {/* FILTER PANEL */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap gap-4 items-end z-10 relative">
        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
            {EXAM_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Class</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); setSelectedSubject(""); }} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
            <option value="">-- Choose --</option>
            {availableClasses.map(cls => <option key={cls as string} value={cls as string}>{cls as string}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Section</label>
          <select value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setSelectedSubject(""); }} disabled={!selectedClass} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] disabled:opacity-50">
            <option value="">-- Choose --</option>
            {availableSections.map(sec => <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest">Select Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedSection} className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-200 font-bold text-green-700 disabled:opacity-50 disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400">
            <option value="">-- Choose --</option>
            {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-1/5 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Default Total Marks</label>
          <input type="number" value={globalTotalMarks} onChange={e => setGlobalTotalMarks(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] text-center" />
        </div>
      </div>

      {/* DATA ENTRY GRID */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {(!selectedClass || !selectedSection || !selectedSubject) ? (
          <div className="h-[400px] flex flex-col items-center justify-center opacity-40">
             <BookOpen size={60} className="mb-4 text-slate-400" />
             <h3 className="text-xl font-black text-slate-600">Select Criteria to Load Roster</h3>
             <p className="font-medium text-sm mt-1">Choose Term, Class, Section, and Subject from above.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center opacity-40">
             <Users size={60} className="mb-4 text-slate-400" />
             <h3 className="text-xl font-black text-slate-600">No Students Found</h3>
             <p className="font-medium text-sm mt-1">Admit students to this section first.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
               <div>
                 <h2 className="text-lg font-black">{selectedClass} - {selectedSection}</h2>
                 <p className="text-xs text-slate-300 font-medium">Entering marks for: <span className="font-bold text-[#3ac47d]">{selectedSubject}</span> ({selectedTerm})</p>
               </div>
               <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold">
                 {filteredStudents.length} Students
               </div>
            </div>

            {/* Table Columns */}
            <div className="px-6 py-3 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
              <div className="col-span-1">Roll No</div>
              <div className="col-span-4">Student Name</div>
              <div className="col-span-2 text-center">Total Marks</div>
              <div className="col-span-2 text-center">Obtained</div>
              <div className="col-span-3 text-right">Result Preview</div>
            </div>

            {/* Student Rows */}
            {filteredStudents.sort((a,b) => (a.rollNumber||0) - (b.rollNumber||0)).map((student) => {
              const sMarks = marksEntry[student.id] || { obtained: "", total: globalTotalMarks };
              const percent = sMarks.total && sMarks.obtained ? ((Number(sMarks.obtained) / Number(sMarks.total)) * 100).toFixed(1) : "0.0";
              const grade = calculateGrade(Number(sMarks.obtained), Number(sMarks.total));
              const isFail = grade === "U";

              return (
                <div key={student.id} className="px-6 py-3 grid grid-cols-12 gap-4 items-center bg-white hover:bg-slate-50 transition-colors group">
                  <div className="col-span-1 font-black text-slate-400 text-lg">{student.rollNumber || "-"}</div>
                  
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden shrink-0">
                      {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Users size={14}/></div>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{student.fatherName}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <input 
                      type="number" 
                      value={sMarks.total} 
                      onChange={(e) => handleMarkChange(student.id, "total", e.target.value)}
                      className="w-16 bg-slate-100 text-center rounded-lg py-2 text-sm font-bold border border-transparent focus:border-blue-400 outline-none"
                    />
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <input 
                      type="number" 
                      placeholder="0"
                      value={sMarks.obtained} 
                      onChange={(e) => handleMarkChange(student.id, "obtained", e.target.value)}
                      className="w-20 bg-white text-center rounded-lg py-2 text-sm font-black border-2 border-slate-200 focus:border-[#3ac47d] focus:bg-[#f0fdf4] outline-none shadow-inner transition-all"
                    />
                  </div>

                  <div className="col-span-3 flex justify-end items-center gap-3">
                     <span className="text-xs font-bold text-slate-500">{percent}%</span>
                     <span className={`w-10 text-center py-1 rounded-md text-xs font-black ${isFail ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                       {grade}
                     </span>
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
