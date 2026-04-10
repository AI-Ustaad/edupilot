"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, FileSignature, Search, Calculator, Trash2, History, BookOpen } from "lucide-react";

// مضامین اور ان کے کل نمبر (آسانی کے لیے)
const SUBJECTS_TEMPLATE = [
  { id: "english", name: "English", total: 100 },
  { id: "urdu", name: "Urdu", total: 100 },
  { id: "math", name: "Mathematics", total: 100 },
  { id: "science", name: "Science / General Science", total: 100 },
  { id: "computer", name: "Computer / Arts", total: 100 },
  { id: "islamiat", name: "Islamic Studies", total: 50 },
];

export default function MarksPage() {
  // Vercel SSR Bypass
  const [isMounted, setIsMounted] = useState(false);

  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [recentMarks, setRecentMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters State
  const [selectedTerm, setSelectedTerm] = useState("1st Term");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Marks State
  const [marks, setMarks] = useState<Record<string, string>>({});

  // 1. Fetch Data on Mount
  useEffect(() => {
    setIsMounted(true);

    const unsubStudents = onSnapshot(query(collection(db, "students"), orderBy("rollNumber", "asc")), (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMarks = onSnapshot(query(collection(db, "marks"), orderBy("createdAt", "desc")), (snapshot) => {
      setRecentMarks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStudents(); unsubMarks(); };
  }, []);

  // 2. Cascading Dropdowns Logic
  const availableClasses = Array.from(new Set(students.map(s => s.classGrade))).filter(Boolean);
  const availableSections = Array.from(new Set(students.filter(s => s.classGrade === selectedClass).map(s => s.section))).filter(Boolean);
  const availableStudents = students.filter(s => s.classGrade === selectedClass && s.section === selectedSection);
  const activeStudent = students.find(s => s.id === selectedStudentId);

  // 3. Handlers & Calculations
  const handleMarkChange = (subjectId: string, value: string) => {
    setMarks(prev => ({ ...prev, [subjectId]: value }));
  };

  const calculateTotal = () => {
    let obtained = 0;
    let max = 0;
    SUBJECTS_TEMPLATE.forEach(sub => {
      max += sub.total;
      obtained += Number(marks[sub.id]) || 0;
    });
    const percentage = max > 0 ? ((obtained / max) * 100).toFixed(1) : "0";
    
    let grade = "F";
    const p = Number(percentage);
    if (p >= 80) grade = "A+";
    else if (p >= 70) grade = "A";
    else if (p >= 60) grade = "B";
    else if (p >= 50) grade = "C";
    else if (p >= 40) grade = "D";

    return { obtained, max, percentage, grade };
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return setErrorMsg("Please select a student.");
    
    setLoading(true); setErrorMsg(""); setSuccess(false);

    const calc = calculateTotal();

    try {
      await addDoc(collection(db, "marks"), {
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        rollNumber: activeStudent.rollNumber,
        classGrade: activeStudent.classGrade,
        section: activeStudent.section || "",
        term: selectedTerm,
        marks: marks,
        totalObtained: calc.obtained,
        totalMax: calc.max,
        percentage: calc.percentage,
        grade: calc.grade,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setMarks({}); // Reset marks
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg("Failed to save marks.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm("Delete this mark sheet record?")) await deleteDoc(doc(db, "marks", id));
  };

  if (!isMounted) return null;

  const currentCalc = calculateTotal();

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Smart Marks Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Dynamic grading system connected to Central Database.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 font-bold text-sm text-slate-600">
          <History size={18} /> {recentMarks.length} Records Saved
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Filters & Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><FileSignature size={20} className="text-[#3ac47d]"/> Configure Assessment</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A]">
                <option>1st Term</option><option>2nd Term</option><option>Final Term</option>
              </select>
              
              <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); setSelectedStudentId(""); }} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border">
                <option value="" disabled>Select Class</option>
                {availableClasses.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
              </select>
              
              <select value={selectedSection} onChange={(e) => { setSelectedSection(e.target.value); setSelectedStudentId(""); }} disabled={!selectedClass} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border disabled:opacity-50">
                <option value="">Section</option>
                {availableSections.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
              </select>

              <select required value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={!selectedSection} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border disabled:opacity-50 font-bold text-[#3ac47d]">
                <option value="" disabled>-- Select Student --</option>
                {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNumber})</option>)}
              </select>
            </div>

            {!activeStudent ? (
               <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                 <BookOpen size={40} className="mb-3 opacity-50" />
                 <p className="font-medium text-sm">Select a Student to start entering marks.</p>
               </div>
            ) : (
               <form onSubmit={handleSaveMarks} className="space-y-6 animate-fade-in-down">
                 {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex gap-3"><CheckCircle2/> Marks saved successfully!</div>}
                 {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex gap-3"><AlertCircle/> {errorMsg}</div>}

                 <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-4 pb-2 border-b border-slate-100">
                   <div className="col-span-6">Subject</div>
                   <div className="col-span-3 text-center">Total Marks</div>
                   <div className="col-span-3 text-center">Obtained</div>
                 </div>

                 <div className="space-y-3">
                   {SUBJECTS_TEMPLATE.map(sub => (
                     <div key={sub.id} className="grid grid-cols-12 gap-4 items-center px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors">
                       <div className="col-span-6 font-bold text-slate-700">{sub.name}</div>
                       <div className="col-span-3 text-center text-slate-500 font-medium">{sub.total}</div>
                       <div className="col-span-3">
                         <input 
                           type="number" 
                           min="0" max={sub.total}
                           value={marks[sub.id] || ""}
                           onChange={(e) => handleMarkChange(sub.id, e.target.value)}
                           className="w-full bg-white outline-none rounded-lg px-3 py-2 text-sm border border-slate-200 text-center focus:ring-2 focus:ring-[#3ac47d]/50 font-bold" 
                         />
                       </div>
                     </div>
                   ))}
                 </div>

                 {/* Live Result Calculation */}
                 <div className="bg-[#0F172A] rounded-2xl p-6 text-white mt-6 grid grid-cols-3 gap-4 text-center">
                   <div><p className="text-[10px] text-slate-400 uppercase tracking-widest">Total</p><p className="text-xl font-black">{currentCalc.obtained} <span className="text-sm font-medium text-slate-500">/ {currentCalc.max}</span></p></div>
                   <div><p className="text-[10px] text-slate-400 uppercase tracking-widest">Percentage</p><p className="text-xl font-black text-blue-400">{currentCalc.percentage}%</p></div>
                   <div><p className="text-[10px] text-slate-400 uppercase tracking-widest">Grade</p><p className="text-xl font-black text-[#3ac47d]">{currentCalc.grade}</p></div>
                 </div>

                 <button disabled={loading} type="submit" className="w-full bg-[#3ac47d] hover:bg-[#2eaa6a] text-white py-4 rounded-xl font-bold flex justify-center gap-2 shadow-md transition-all">
                   {loading ? "Processing..." : "Save Mark Sheet"}
                 </button>
               </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Entries Ledger */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full max-h-[800px] flex flex-col">
             <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-slate-800">Recent Entries</h2></div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
               {recentMarks.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                   <Calculator size={40} className="text-slate-300 mb-3" />
                   <p className="text-sm font-medium text-slate-500">No marks entered yet.</p>
                 </div>
               ) : (
                 recentMarks.map((record) => (
                   <div key={record.id} className="flex flex-col gap-2 p-4 bg-slate-50 hover:bg-[#f0fdf4] transition-all rounded-xl border border-slate-100/50 group relative">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="text-sm font-bold text-[#0F172A]">{record.studentName}</p>
                         <p className="text-[10px] text-slate-500 mt-0.5">{record.classGrade} {record.section} • {record.term}</p>
                       </div>
                       <div className="text-right">
                         <span className="font-black text-[#3ac47d] text-lg">{record.percentage}%</span>
                         <p className="text-[10px] font-bold text-slate-400">Grade: {record.grade}</p>
                       </div>
                     </div>
                     <button onClick={() => handleDeleteRecord(record.id)} className="absolute bottom-3 right-3 p-1.5 text-red-500 hover:bg-red-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                       <Trash2 size={14} />
                     </button>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
