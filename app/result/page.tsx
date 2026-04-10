"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Printer, FileText, CheckCircle2, XCircle, Award, BookOpen, X } from "lucide-react";

export default function ResultPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [allMarks, setAllMarks] = useState<any[]>([]);
  
  const [selectedTerm, setSelectedTerm] = useState("SBA - 1st Term");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedResult, setSelectedResult] = useState<any>(null); // For Report Card Modal

  useEffect(() => {
    setIsMounted(true);
    const unsubStudents = onSnapshot(query(collection(db, "students"), orderBy("rollNumber", "asc")), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubMarks = onSnapshot(query(collection(db, "marks"), orderBy("createdAt", "desc")), (snapshot) => {
      setAllMarks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubStudents(); unsubMarks(); };
  }, []);

  const availableClasses = Array.from(new Set(students.map(s => s.classGrade))).filter(Boolean);
  const availableSections = Array.from(new Set(students.filter(s => s.classGrade === selectedClass).map(s => s.section))).filter(Boolean);

  // Filter students based on selection
  let filteredStudents = students.filter(s => s.classGrade === selectedClass && s.section === selectedSection);
  if (searchQuery) {
    filteredStudents = filteredStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNumber?.toString().includes(searchQuery));
  }

  // Combine Students with their Marks for the selected term
  const classResults = filteredStudents.map(student => {
    const studentMarkRecord = allMarks.find(m => m.studentId === student.id && m.term === selectedTerm);
    return { ...student, resultRecord: studentMarkRecord || null };
  });

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Exams & Grading</h1>
          <p className="text-sm text-slate-500 mt-1">Smart Results Generation & Printing Engine.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 print:hidden">
        <h2 className="text-sm font-bold text-[#3ac47d] uppercase tracking-widest mb-4 flex items-center gap-2"><Award size={16}/> Configure Result Board</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] cursor-pointer">
            <optgroup label="School Based Assessment (SBA)">
              <option value="SBA - 1st Term">1st Term</option>
              <option value="SBA - 2nd Term">2nd Term</option>
              <option value="SBA - Final Term">Final Term</option>
            </optgroup>
            <optgroup label="Other Assessments">
              <option value="Monthly Test">Monthly Test</option>
              <option value="Pre-Board / Mock Exams">Pre-Board / Mock Exams</option>
              <option value="Admission Test">Admission Test</option>
            </optgroup>
          </select>
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border cursor-pointer">
            <option value="" disabled>Select Class</option>
            {availableClasses.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
          </select>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border disabled:opacity-50 cursor-pointer">
            <option value="">Select Section</option>
            {availableSections.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white outline-none rounded-xl pl-10 pr-4 py-3 text-sm border" />
          </div>
        </div>
      </div>

      {/* Results Board */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        <div className="bg-[#0F172A] px-6 py-4 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Roll</div>
          <div className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student Details</div>
          <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</div>
          <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Score & Grade</div>
          <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-100">
          {!selectedClass || !selectedSection ? (
            <div className="py-20 text-center opacity-50 flex flex-col items-center">
              <FileText size={48} className="text-slate-300 mb-4" />
              <p className="font-bold text-slate-500">Select Class and Section to view results.</p>
            </div>
          ) : classResults.length === 0 ? (
            <div className="py-20 text-center"><p className="font-bold text-slate-500">No students found.</p></div>
          ) : (
            classResults.map((student) => (
              <div key={student.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-1 font-black text-slate-400 text-lg">{student.rollNumber || "-"}</div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 text-slate-400 flex items-center justify-center"><BookOpen size={16}/></div>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{student.name}</p>
                    <p className="text-[11px] text-slate-500">Class {student.classGrade} - {student.section}</p>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  {student.resultRecord ? 
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Generated</span> : 
                    <span className="bg-red-50 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><XCircle size={12}/> Pending</span>
                  }
                </div>
                <div className="col-span-3 flex flex-col items-center justify-center">
                  {student.resultRecord ? (
                    <>
                      <p className="font-black text-[#0F172A]">{student.resultRecord.percentage}% <span className={`text-sm ${student.resultRecord.grade === 'U' ? 'text-red-500' : 'text-[#3ac47d]'}`}>({student.resultRecord.grade})</span></p>
                      <p className="text-[10px] text-slate-500 font-medium">{student.resultRecord.totalObtained} / {student.resultRecord.totalMax}</p>
                    </>
                  ) : <span className="text-slate-400 font-medium text-sm">-</span>}
                </div>
                <div className="col-span-2 flex justify-end">
                  <button 
                    disabled={!student.resultRecord}
                    onClick={() => setSelectedResult(student.resultRecord)}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer size={16} /> View Card
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- OFFICIAL RESULT CARD MODAL (Printable Area) --- */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative print:rounded-none print:shadow-none print:max-w-none">
            
            {/* Modal Controls (Hidden in Print) */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden z-10">
              <button onClick={() => window.print()} className="bg-[#3ac47d] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md"><Printer size={16}/> Print</button>
              <button onClick={() => setSelectedResult(null)} className="bg-slate-800 text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-md hover:bg-red-500 transition-colors"><X size={18}/></button>
            </div>

            {/* --- REPORT CARD DESIGN --- */}
            <div className="p-8 print:p-0">
              
              {/* School Header */}
              <div className="text-center border-b-2 border-black pb-4 mb-6">
                <h1 className="text-3xl font-black text-black uppercase tracking-widest">EduPilot School System</h1>
                <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">Official Report Card</p>
                <div className="inline-block mt-3 bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full">{selectedResult.term}</div>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><span className="font-bold text-gray-500 uppercase text-xs">Student Name:</span> <p className="font-black text-lg uppercase">{selectedResult.studentName}</p></div>
                <div className="text-right"><span className="font-bold text-gray-500 uppercase text-xs">Roll Number:</span> <p className="font-black text-lg">{selectedResult.rollNumber}</p></div>
                <div><span className="font-bold text-gray-500 uppercase text-xs">Class / Section:</span> <p className="font-bold">{selectedResult.classGrade} - {selectedResult.section}</p></div>
                <div className="text-right"><span className="font-bold text-gray-500 uppercase text-xs">Academic Level:</span> <p className="font-bold">{selectedResult.level}</p></div>
              </div>

              {/* Marks Table */}
              <table className="w-full border-collapse border border-black mb-6 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2 text-left font-bold uppercase">Subjects</th>
                    <th className="border border-black p-2 text-center font-bold uppercase w-24">Total</th>
                    <th className="border border-black p-2 text-center font-bold uppercase w-24">Obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedResult.marks).map(([subject, mark]) => (
                    <tr key={subject}>
                      <td className="border border-black p-2 font-bold text-gray-800">{subject}</td>
                      <td className="border border-black p-2 text-center">100</td>
                      <td className="border border-black p-2 text-center font-bold">{mark as string}</td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-100 font-black">
                    <td className="border border-black p-2 text-right uppercase tracking-widest">Grand Total</td>
                    <td className="border border-black p-2 text-center">{selectedResult.totalMax}</td>
                    <td className="border border-black p-2 text-center text-lg">{selectedResult.totalObtained}</td>
                  </tr>
                </tbody>
              </table>

              {/* Grading Summary (2026 Format) */}
              <div className="flex justify-between items-center bg-gray-50 p-4 border border-black rounded-xl print:rounded-none">
                <div className="text-center"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Percentage</p><p className="text-2xl font-black">{selectedResult.percentage}%</p></div>
                <div className="text-center"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">2026 Grade</p><p className="text-3xl font-black text-black">{selectedResult.grade}</p></div>
                <div className="text-center"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Remarks</p><p className={`text-lg font-black uppercase tracking-widest ${selectedResult.grade === 'U' ? 'text-black' : 'text-black'}`}>{selectedResult.grade === 'U' ? 'Needs Work' : 'Promoted'}</p></div>
              </div>

              {/* Signatures */}
              <div className="mt-16 flex justify-between items-end">
                <div className="text-center"><div className="w-40 border-b border-black mb-2"></div><p className="text-xs font-bold uppercase">Class Teacher</p></div>
                <div className="text-center"><div className="w-40 border-b border-black mb-2"></div><p className="text-xs font-bold uppercase">Principal Signature</p></div>
              </div>
              
              <div className="mt-6 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold print:block hidden">System Generated Report Card - IBCC 2026 Grading Standards</div>

            </div>
          </div>
        </div>
      )}

      {/* Global Print Styles to isolate modal */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .fixed { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 9999; background: white; }
          .fixed * { visibility: visible; }
          @page { margin: 1cm; }
        }
      `}</style>

    </div>
  );
}
