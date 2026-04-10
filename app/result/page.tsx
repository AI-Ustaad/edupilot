"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Search, Printer, FileText, CheckCircle2, XCircle, Award, BookOpen, X, User } from "lucide-react";

export default function ResultPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [allMarks, setAllMarks] = useState<any[]>([]);
  
  const [schoolDetails, setSchoolDetails] = useState({ name: "EDUPILOT SCHOOL SYSTEM", address: "Main Campus, Pakistan" });

  const [selectedTerm, setSelectedTerm] = useState("SBA - Final Term");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedResult, setSelectedResult] = useState<any>(null); 

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(docSnap => {
        if (docSnap.exists() && docSnap.data().schoolName) {
          setSchoolDetails(prev => ({ ...prev, name: docSnap.data().schoolName }));
        }
      });
    }

    const unsubStudents = onSnapshot(query(collection(db, "students"), orderBy("rollNumber", "asc")), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubMarks = onSnapshot(query(collection(db, "marks"), orderBy("createdAt", "desc")), (snapshot) => {
      setAllMarks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubStudents(); unsubMarks(); };
  }, [user]);

  const availableClasses = Array.from(new Set(students.map(s => s.classGrade))).filter(Boolean);
  const availableSections = Array.from(new Set(students.filter(s => s.classGrade === selectedClass).map(s => s.section))).filter(Boolean);

  let filteredStudents = students.filter(s => s.classGrade === selectedClass && s.section === selectedSection);
  if (searchQuery) {
    filteredStudents = filteredStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNumber?.toString().includes(searchQuery));
  }

  const classResults = filteredStudents.map(student => {
    const studentMarkRecord = allMarks.find(m => m.studentId === student.id && m.term === selectedTerm);
    return { ...student, resultRecord: studentMarkRecord || null };
  });

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20 print:space-y-0 print:pb-0">
      
      {/* --- HEADER & CONTROLS (HIDDEN IN PRINT) --- */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Exams & Grading</h1>
          <p className="text-sm text-slate-500 mt-1">Smart Results Generation & Printing Engine.</p>
        </div>
      </div>

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
            <div className="py-20 text-center opacity-50 flex flex-col items-center"><FileText size={48} className="text-slate-300 mb-4" /><p className="font-bold text-slate-500">Select Class and Section to view results.</p></div>
          ) : classResults.length === 0 ? (
            <div className="py-20 text-center"><p className="font-bold text-slate-500">No students found.</p></div>
          ) : (
            classResults.map((student) => (
              <div key={student.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-1 font-black text-slate-400 text-lg">{student.rollNumber || "-"}</div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">{student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 text-slate-400 flex items-center justify-center"><BookOpen size={16}/></div>}</div>
                  <div><p className="font-bold text-slate-800">{student.name}</p><p className="text-[11px] text-slate-500">Class {student.classGrade} - {student.section}</p></div>
                </div>
                <div className="col-span-2 flex justify-center">
                  {student.resultRecord ? <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Generated</span> : <span className="bg-red-50 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><XCircle size={12}/> Pending</span>}
                </div>
                <div className="col-span-3 flex flex-col items-center justify-center">
                  {student.resultRecord ? <><p className="font-black text-[#0F172A]">{student.resultRecord.percentage}% <span className={`text-sm ${student.resultRecord.grade === 'U' ? 'text-red-500' : 'text-[#3ac47d]'}`}>({student.resultRecord.grade})</span></p><p className="text-[10px] text-slate-500 font-medium">{student.resultRecord.totalObtained} / {student.resultRecord.totalMax}</p></> : <span className="text-slate-400 font-medium text-sm">-</span>}
                </div>
                <div className="col-span-2 flex justify-end">
                  <button disabled={!student.resultRecord} onClick={() => setSelectedResult({ ...student, resultRecord: student.resultRecord })} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
        <div id="print-overlay" className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm overflow-y-auto print:overflow-visible print:bg-white print:static">
          
          {/* Changed items-center to items-start so it scrolls properly if it's too tall */}
          <div className="min-h-screen flex items-start justify-center p-4 sm:p-8 print:p-0 print:block">
            
            <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl relative mt-4 mb-4 sm:mt-10 sm:mb-10 p-6 sm:p-10 print:m-0 print:p-0 print:rounded-none print:shadow-none print:border-none">
              
              {/* Modal Controls (Hidden in Print) - Now safely inside the scrolling area */}
              <div className="flex justify-end gap-3 mb-6 print:hidden border-b border-slate-100 pb-4">
                <button onClick={() => window.print()} className="bg-[#3ac47d] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-[#2eaa6a] transition-colors">
                  <Printer size={18}/> Print Card
                </button>
                <button onClick={() => setSelectedResult(null)} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-red-500 transition-colors">
                  <X size={18}/> Close
                </button>
              </div>

              {/* --- THE A4 REPORT CARD DESIGN --- */}
              <div className="print:w-full print:mx-auto print:max-w-[210mm] print:px-8 print:py-6">
                
                {/* School Header with Logo */}
                <div className="flex justify-between items-center border-b-[3px] border-black pb-6 mb-8 mt-2">
                  <div className="w-24 h-24 bg-slate-50 border-2 border-black rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Award size={40} className="text-black" />
                  </div>
                  <div className="text-center flex-1 px-4">
                    <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-widest">{schoolDetails.name}</h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-1.5">Official Report Card</p>
                    <p className="text-xs text-gray-500 uppercase mt-1">{schoolDetails.address}</p>
                  </div>
                  <div className="w-24 h-24 flex items-center justify-center shrink-0">
                    <div className="bg-black text-white px-3 py-2.5 text-[11px] font-bold uppercase text-center rounded-lg w-full shadow-md leading-tight">{selectedResult.resultRecord.term}</div>
                  </div>
                </div>

                {/* Student Info & Photo Layout */}
                <div className="flex justify-between items-end mb-8 border-b-2 border-gray-200 pb-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm flex-1">
                    <div><span className="font-bold text-gray-500 uppercase text-xs">Student Name:</span> <p className="font-black text-xl uppercase text-black mt-1">{selectedResult.name}</p></div>
                    <div><span className="font-bold text-gray-500 uppercase text-xs">Roll Number:</span> <p className="font-black text-xl text-black mt-1">{selectedResult.rollNumber}</p></div>
                    <div><span className="font-bold text-gray-500 uppercase text-xs">Father's Name:</span> <p className="font-bold text-sm uppercase mt-0.5">{selectedResult.fatherName || "N/A"}</p></div>
                    <div><span className="font-bold text-gray-500 uppercase text-xs">Date of Birth:</span> <p className="font-bold text-sm mt-0.5">{selectedResult.dob || "N/A"}</p></div>
                    <div><span className="font-bold text-gray-500 uppercase text-xs">Class / Section:</span> <p className="font-bold text-sm mt-0.5">{selectedResult.classGrade} - {selectedResult.section}</p></div>
                    <div><span className="font-bold text-gray-500 uppercase text-xs">Academic Level:</span> <p className="font-bold text-sm mt-0.5">{selectedResult.resultRecord.level}</p></div>
                  </div>
                  
                  {/* Passport Size Picture */}
                  <div className="w-32 h-36 border-[3px] border-black rounded-lg overflow-hidden shrink-0 ml-6 flex items-center justify-center bg-gray-50 shadow-md">
                    {selectedResult.photoBase64 ? (
                      <img src={selectedResult.photoBase64} className="w-full h-full object-cover" />
                    ) : (
                      <User size={50} className="text-gray-300" />
                    )}
                  </div>
                </div>

                {/* Marks Table */}
                <table className="w-full border-collapse border-2 border-black mb-8 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border-2 border-black py-3 px-4 text-left font-black uppercase text-sm tracking-wider">Subjects</th>
                      <th className="border-2 border-black py-3 px-4 text-center font-black uppercase text-sm w-32 tracking-wider">Total</th>
                      <th className="border-2 border-black py-3 px-4 text-center font-black uppercase text-sm w-32 tracking-wider">Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedResult.resultRecord.marks).map(([subject, mark]) => (
                      <tr key={subject}>
                        <td className="border-2 border-black py-2.5 px-4 font-bold text-gray-800 text-sm uppercase">{subject}</td>
                        <td className="border-2 border-black py-2.5 px-4 text-center text-sm font-bold text-gray-600">100</td>
                        <td className="border-2 border-black py-2.5 px-4 text-center font-black text-base">{mark as string}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-200 font-black">
                      <td className="border-2 border-black py-4 px-4 text-right uppercase tracking-widest text-sm">Grand Total</td>
                      <td className="border-2 border-black py-4 px-4 text-center text-base">{selectedResult.resultRecord.totalMax}</td>
                      <td className="border-2 border-black py-4 px-4 text-center text-xl">{selectedResult.resultRecord.totalObtained}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Grading Summary */}
                <div className="flex justify-between items-center bg-gray-50 p-6 border-2 border-black rounded-xl print:rounded-none">
                  <div className="text-center w-1/3"><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Percentage</p><p className="text-3xl font-black mt-2 text-black">{selectedResult.resultRecord.percentage}%</p></div>
                  <div className="text-center w-1/3 border-x-2 border-black"><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">2026 Grade</p><p className="text-5xl font-black text-black mt-1">{selectedResult.resultRecord.grade}</p></div>
                  <div className="text-center w-1/3"><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Remarks</p><p className="text-xl font-black uppercase tracking-widest mt-2 text-black">{selectedResult.resultRecord.grade === 'U' ? 'Needs Work' : 'Promoted'}</p></div>
                </div>

                {/* Signatures */}
                <div className="mt-20 flex justify-between items-end px-10">
                  <div className="text-center"><div className="w-56 border-b-[3px] border-black mb-3"></div><p className="text-xs font-bold uppercase tracking-widest text-black">Class Teacher</p></div>
                  <div className="text-center"><div className="w-56 border-b-[3px] border-black mb-3"></div><p className="text-xs font-bold uppercase tracking-widest text-black">Principal Signature</p></div>
                </div>

                <div className="mt-10 text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold print:block hidden">System Generated Report Card - Aligned with IBCC 2026 Standards</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- THE ULTIMATE CSS PRINT FIX --- */}
      <style jsx global>{`
        @media print {
          /* Hide EVERYTHING in the body */
          body {
            visibility: hidden !important;
          }
          /* Show ONLY the print overlay */
          #print-overlay {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            background: white !important;
            z-index: 999999 !important;
          }
          /* Ensure children of the overlay are visible */
          #print-overlay * {
            visibility: visible !important;
          }
          /* Ensure it fits on a single A4 page */
          @page {
            size: A4 portrait;
            margin: 15mm; 
          }
        }
      `}</style>

    </div>
  );
}
