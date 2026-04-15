"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Award, Search, Printer, AlertCircle, CheckCircle2, 
  X, GraduationCap, Building2, Eye, ShieldAlert
} from "lucide-react";

// Exam Categories
const EXAM_TERMS = ["1st Term", "2nd Term", "Final Exams", "Monthly Test", "Mock Exams", "SBA"];

// 🧠 MAGIC FUNCTION: Ignores case and spaces for flawless matching
const norm = (str?: string) => (str || "").trim().toLowerCase();

// Auto-calculate Grade Helper
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

export default function ResultsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<any[]>([]);
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  
  const [selectedTerm, setSelectedTerm] = useState(EXAM_TERMS[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStudentForCard, setSelectedStudentForCard] = useState<any | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snap) => setStudentsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubMarks = onSnapshot(query(collection(db, "marks")), (snap) => setMarksData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) => setSectionsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubStudents(); unsubMarks(); unsubSections(); };
  }, []);

  // Derived Data
  const availableClasses = Array.from(new Set(sectionsData.map(s => s.classGrade)));
  const availableSections = sectionsData.filter(s => norm(s.classGrade) === norm(selectedClass));

  // Filter Students
  const filteredStudents = studentsData.filter(s => {
    const matchClass = norm(s.classGrade) === norm(selectedClass);
    const matchSec = norm(s.section) === norm(selectedSection);
    const matchSearch = norm(s.name).includes(norm(searchQuery)) || norm(s.rollNumber?.toString()).includes(norm(searchQuery));
    return matchClass && matchSec && (!searchQuery || matchSearch);
  });

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* 🖨️ CSS TRICK FOR PERFECT PRINTING */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-result-card, #printable-result-card * { visibility: visible; }
          #printable-result-card { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
          .print-hide { display: none !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="flex justify-between items-end print-hide">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Award className="text-[#3ac47d]"/> Exams & Grading
          </h1>
          <p className="text-sm text-slate-500 mt-1">Smart Results Generation & Printing Engine.</p>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 print-hide">
        <h3 className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-4 flex items-center gap-2">
          CONFIGURE RESULT BOARD
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
            {EXAM_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
          </select>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
            <option value="">-- Select Class --</option>
            {availableClasses.map(cls => <option key={cls as string} value={cls as string}>{cls as string}</option>)}
          </select>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] disabled:opacity-50">
            <option value="">-- Select Section --</option>
            {availableSections.map(sec => <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl pl-9 pr-4 py-3 text-sm border font-bold text-[#0F172A]" />
          </div>
        </div>
      </div>

      {/* STUDENTS RESULT GRID */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] print-hide">
        <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
           <div>
             <h2 className="text-lg font-black uppercase">{selectedClass || "Select a Class"} - {selectedSection || "Section"}</h2>
             <p className="text-xs text-slate-300 font-medium">Generating results for: <span className="font-bold text-[#3ac47d] uppercase">{selectedTerm}</span></p>
           </div>
        </div>

        <div className="px-6 py-3 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
          <div className="col-span-1">Roll</div>
          <div className="col-span-4">Student Details</div>
          <div className="col-span-3 text-center">Status</div>
          <div className="col-span-2 text-center">Score & Grade</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {(!selectedClass || !selectedSection) ? (
          <div className="py-20 text-center opacity-40">
             <Award size={60} className="mx-auto mb-4 text-slate-400" />
             <h3 className="text-xl font-black text-slate-600">Select Class & Section</h3>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-20 text-center opacity-40">
             <h3 className="text-xl font-black text-slate-600">No Students Found</h3>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.sort((a,b) => (a.rollNumber||0) - (b.rollNumber||0)).map((student) => {
              
              // 🧠 CORE LOGIC FOR RESULTS
              const studentMarks = marksData.filter(m => m.studentId === student.id);
              const termMarks = studentMarks.filter(m => norm(m.term) === norm(selectedTerm));
              
              let status = "Pending";
              let statusColor = "bg-red-50 text-red-500";
              let scoreStr = "-";
              let gradeStr = "-";
              let isReady = false;
              let missingPrereqs = false;

              // FINAL EXAMS PREREQUISITE CHECK
              if (norm(selectedTerm) === norm("Final Exams")) {
                const has1st = studentMarks.some(m => norm(m.term) === norm("1st Term"));
                const has2nd = studentMarks.some(m => norm(m.term) === norm("2nd Term"));
                if (!has1st || !has2nd) {
                  missingPrereqs = true;
                  status = "Missing 1st/2nd Term";
                  statusColor = "bg-orange-50 text-orange-600 border border-orange-200";
                }
              }

              // CALCULATE TOTALS IF MARKS EXIST
              if (termMarks.length > 0) {
                const totalObt = termMarks.reduce((acc, curr) => acc + Number(curr.marksObtained || 0), 0);
                const totalMax = termMarks.reduce((acc, curr) => acc + Number(curr.totalMarks || 0), 0);
                const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
                
                gradeStr = calculateGrade(totalObt, totalMax);
                scoreStr = `${pct.toFixed(1)}%`;
                
                if (!missingPrereqs) {
                  status = "Ready / Generated";
                  statusColor = "bg-green-50 text-green-600 border border-green-200";
                  isReady = true;
                }
              }

              return (
                <div key={student.id} className="px-6 py-3 grid grid-cols-12 gap-4 items-center bg-white hover:bg-slate-50 transition-colors">
                  <div className="col-span-1 font-black text-slate-400 text-lg">{student.rollNumber || "-"}</div>
                  
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden shrink-0">
                      {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400"><GraduationCap size={14}/></div>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{student.classGrade} - {student.section}</p>
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-center">
                     <span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 ${statusColor}`}>
                       {missingPrereqs ? <ShieldAlert size={12}/> : (isReady ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>)}
                       {status}
                     </span>
                  </div>

                  <div className="col-span-2 flex justify-center items-center gap-2">
                     <span className="text-xs font-bold text-slate-600">{scoreStr}</span>
                     {gradeStr !== "-" && <span className={`w-8 text-center py-1 rounded-md text-[10px] font-black ${gradeStr === "U" ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{gradeStr}</span>}
                  </div>

                  <div className="col-span-2 flex justify-end">
                     <button 
                       onClick={() => setSelectedStudentForCard(student)}
                       disabled={termMarks.length === 0 && !missingPrereqs}
                       className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-30 disabled:bg-slate-50 disabled:text-slate-400 bg-blue-50 text-blue-600 hover:bg-blue-100"
                     >
                       <Eye size={14} /> View Card
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🚀 THE ULTIMATE RESULT CARD MODAL */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:p-0 print:bg-white">
           
           <div id="printable-result-card" className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:max-w-full">
              
              {/* Modal Header (Hidden on Print) */}
              <div className="bg-slate-100 px-6 py-4 flex justify-between items-center print-hide border-b border-slate-200">
                 <h2 className="font-black text-slate-700 flex items-center gap-2"><Award size={18}/> Result Card Preview</h2>
                 <div className="flex gap-2">
                    <button onClick={() => window.print()} className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                      <Printer size={14}/> Print
                    </button>
                    <button onClick={() => setSelectedStudentForCard(null)} className="bg-white hover:bg-slate-200 text-slate-600 p-2 rounded-lg transition-colors border border-slate-300">
                      <X size={16}/>
                    </button>
                 </div>
              </div>

              {/* 🎓 THE ACTUAL REPORT CARD (This prints) */}
              <div className="p-8 sm:p-12 bg-white">
                 
                 {/* School Header */}
                 <div className="text-center mb-8 border-b-2 border-[#0F172A] pb-6">
                    <div className="w-16 h-16 bg-[#f0fdf4] text-[#3ac47d] rounded-full flex items-center justify-center mx-auto mb-3">
                       <Building2 size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-[#0F172A] uppercase tracking-widest">EduPilot High School</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{selectedTerm} Result Report</p>
                 </div>

                 {/* Student Info */}
                 <div className="flex justify-between items-end mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="w-20 h-20 bg-white border-2 border-slate-200 rounded-xl overflow-hidden p-1 shadow-sm">
                         {selectedStudentForCard.photoBase64 ? <img src={selectedStudentForCard.photoBase64} className="w-full h-full object-cover rounded-lg"/> : <GraduationCap className="w-full h-full p-2 text-slate-300"/>}
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-[#0F172A]">{selectedStudentForCard.name}</h2>
                          <p className="text-xs font-bold text-slate-500 uppercase mt-1">S/O: {selectedStudentForCard.fatherName}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class & Section</p>
                       <p className="font-black text-lg text-[#0F172A] uppercase">{selectedStudentForCard.classGrade} - {selectedStudentForCard.section}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Roll Number</p>
                       <p className="font-black text-lg text-blue-600">{selectedStudentForCard.rollNumber || "N/A"}</p>
                    </div>
                 </div>

                 {/* Marks Table */}
                 <table className="w-full text-left border-collapse border border-slate-200">
                    <thead>
                       <tr className="bg-[#0F172A] text-white text-xs uppercase tracking-widest">
                          <th className="p-4 font-bold border border-slate-700">Subject</th>
                          <th className="p-4 font-bold border border-slate-700 text-center">Total Marks</th>
                          <th className="p-4 font-bold border border-slate-700 text-center">Obtained</th>
                          <th className="p-4 font-bold border border-slate-700 text-center">%</th>
                          <th className="p-4 font-bold border border-slate-700 text-center">Grade</th>
                       </tr>
                    </thead>
                    <tbody>
                       {(() => {
                         const studentMarks = marksData.filter(m => m.studentId === selectedStudentForCard.id);
                         const termMarks = studentMarks.filter(m => norm(m.term) === norm(selectedTerm));
                         
                         let grandTotalMax = 0;
                         let grandTotalObt = 0;

                         return (
                           <>
                             {termMarks.length === 0 ? (
                               <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">No subjects graded yet.</td></tr>
                             ) : (
                               termMarks.map((m, idx) => {
                                 grandTotalMax += Number(m.totalMarks);
                                 grandTotalObt += Number(m.marksObtained);
                                 return (
                                   <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                                      <td className="p-4 font-black text-slate-700 uppercase">{m.subject}</td>
                                      <td className="p-4 font-bold text-slate-500 text-center">{m.totalMarks}</td>
                                      <td className="p-4 font-black text-[#0F172A] text-center">{m.marksObtained}</td>
                                      <td className="p-4 font-bold text-slate-500 text-center">{m.percentage}%</td>
                                      <td className="p-4 font-black text-center">{m.grade}</td>
                                   </tr>
                                 );
                               })
                             )}
                             
                             {/* Grand Total Row */}
                             {termMarks.length > 0 && (
                               <tr className="bg-slate-100 border-t-2 border-slate-400">
                                  <td className="p-4 font-black text-[#0F172A] uppercase text-right">Grand Total:</td>
                                  <td className="p-4 font-black text-[#0F172A] text-center">{grandTotalMax}</td>
                                  <td className="p-4 font-black text-[#3ac47d] text-center text-xl">{grandTotalObt}</td>
                                  <td className="p-4 font-black text-[#0F172A] text-center">{grandTotalMax > 0 ? ((grandTotalObt/grandTotalMax)*100).toFixed(1) : 0}%</td>
                                  <td className="p-4 font-black text-white text-center">
                                    <span className="bg-[#0F172A] px-3 py-1 rounded-lg">{calculateGrade(grandTotalObt, grandTotalMax)}</span>
                                  </td>
                               </tr>
                             )}
                           </>
                         )
                       })()}
                    </tbody>
                 </table>

                 {/* Footer Signatures */}
                 <div className="flex justify-between items-end mt-20 pt-8 border-t border-slate-200">
                    <div className="text-center w-40">
                       <div className="border-b border-slate-400 pb-2 mb-2"></div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class Incharge</p>
                    </div>
                    <div className="text-center w-40">
                       <div className="border-b border-slate-400 pb-2 mb-2"></div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Principal</p>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      )}

    </div>
  );
}
