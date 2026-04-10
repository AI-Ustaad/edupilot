"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle2, AlertCircle, FileSignature, Calculator, Trash2, History, BookOpen, Lock } from "lucide-react";

// --- 1. SMART LEVEL & SUBJECT CONFIGURATION ---
const SUBJECT_CONFIG = {
  Primary: {
    compulsory: ["Urdu", "English", "Mathematics", "Nazra Quran", "Social / Natural Sciences"],
    electives: []
  },
  Elementary: {
    compulsory: ["Urdu", "English", "Mathematics", "Sciences", "History", "Geography", "Computer Education", "Tarjuma-tul-Quran"],
    electives: ["Arabic", "Persian", "Punjabi", "Fine Arts"]
  },
  Secondary: {
    compulsory: ["Urdu", "English", "Tarjuma-tul-Quran", "Mathematics"],
    electives: ["Physics", "Chemistry", "Biology", "Computer Science", "Civics", "Economics"]
  }
};

const getLevel = (classGrade: string) => {
  if (["Class 9", "Class 10"].includes(classGrade)) return "Secondary";
  if (["Class 6", "Class 7", "Class 8"].includes(classGrade)) return "Elementary";
  return "Primary";
};

// --- 2. 2026 IBCC GRADING SYSTEM (10-Point Scale) ---
const calculateGrade2026 = (percentage: number) => {
  if (percentage >= 96) return "A++";
  if (percentage >= 91) return "A+";
  if (percentage >= 86) return "A";
  if (percentage >= 81) return "B++";
  if (percentage >= 76) return "B+";
  if (percentage >= 71) return "B";
  if (percentage >= 61) return "C+";
  if (percentage >= 51) return "C";
  if (percentage >= 40) return "D"; // Passing mark is now 40%
  return "U"; // Fail / Ungraded
};

export default function MarksPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [recentMarks, setRecentMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedTerm, setSelectedTerm] = useState("1st Term");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [selectedElectives, setSelectedElectives] = useState<string[]>(["", "", ""]);

  // Fetch Data
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

  // Cascading Filters
  const availableClasses = Array.from(new Set(students.map(s => s.classGrade))).filter(Boolean);
  const availableSections = Array.from(new Set(students.filter(s => s.classGrade === selectedClass).map(s => s.section))).filter(Boolean);
  const availableStudents = students.filter(s => s.classGrade === selectedClass && s.section === selectedSection);
  const activeStudent = students.find(s => s.id === selectedStudentId);

  // Reset fields when class changes
  useEffect(() => {
    setMarks({});
    setSelectedElectives(["", "", ""]);
  }, [selectedClass, selectedStudentId]);

  // Current Level Setup
  const currentLevel = selectedClass ? getLevel(selectedClass) : "Primary";
  const compulsorySubjects = selectedClass ? SUBJECT_CONFIG[currentLevel as keyof typeof SUBJECT_CONFIG].compulsory : [];
  const availableElectiveOptions = selectedClass ? SUBJECT_CONFIG[currentLevel as keyof typeof SUBJECT_CONFIG].electives : [];

  // Handlers
  const handleMarkChange = (subjectName: string, value: string) => {
    // Only allow manual entry, max 100
    if (value && Number(value) > 100) return;
    if (value && Number(value) < 0) return;
    setMarks(prev => ({ ...prev, [subjectName]: value }));
  };

  const handleElectiveChange = (index: number, value: string) => {
    const newElectives = [...selectedElectives];
    // If subject was changed, clear its previous marks
    if (newElectives[index] !== value) {
      setMarks(prev => { const m = { ...prev }; delete m[newElectives[index]]; return m; });
    }
    newElectives[index] = value;
    setSelectedElectives(newElectives);
  };

  // The Calculator (Empty Subjects Filtered)
  const calculateResult = () => {
    let obtained = 0;
    let max = 0;
    let validCount = 0;

    const allActiveSubjects = [...compulsorySubjects, ...selectedElectives.filter(Boolean)];
    
    allActiveSubjects.forEach(sub => {
      const m = marks[sub];
      if (m && m.trim() !== "" && !isNaN(Number(m))) {
        obtained += Number(m);
        max += 100; // Each attempted subject carries 100 marks
        validCount++;
      }
    });

    if (validCount === 0) return { obtained: 0, max: 0, percentage: "0.0", grade: "U", validCount: 0 };
    
    const percentage = ((obtained / max) * 100).toFixed(1);
    const grade = calculateGrade2026(Number(percentage));
    
    return { obtained, max, percentage, grade, validCount };
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return setErrorMsg("Please select a student.");
    
    const calc = calculateResult();
    if (calc.validCount === 0) return setErrorMsg("Please enter marks for at least one subject.");

    setLoading(true); setErrorMsg(""); setSuccess(false);

    // Save ONLY filled subjects
    const finalMarksRecord: Record<string, number> = {};
    const allActiveSubjects = [...compulsorySubjects, ...selectedElectives.filter(Boolean)];
    allActiveSubjects.forEach(sub => {
      if (marks[sub] && marks[sub].trim() !== "") {
        finalMarksRecord[sub] = Number(marks[sub]);
      }
    });

    try {
      await addDoc(collection(db, "marks"), {
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        rollNumber: activeStudent.rollNumber,
        classGrade: activeStudent.classGrade,
        section: activeStudent.section || "",
        term: selectedTerm,
        level: currentLevel,
        marks: finalMarksRecord,
        totalObtained: calc.obtained,
        totalMax: calc.max,
        percentage: calc.percentage,
        grade: calc.grade,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setMarks({}); setSelectedElectives(["", "", ""]);
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
  const calc = calculateResult();

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Smart Marks Engine</h1>
          <p className="text-sm text-slate-500 mt-1">2026 IBCC Grading System (10-Point Scale)</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 font-bold text-sm text-slate-600">
          <History size={18} /> {recentMarks.length} Records Saved
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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
              <select required value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={!selectedSection} className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-100 disabled:opacity-50 font-bold text-[#3ac47d]">
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
               <form onSubmit={handleSaveMarks} className="space-y-8 animate-fade-in-down">
                 {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex gap-3"><CheckCircle2/> Marks saved successfully!</div>}
                 {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex gap-3"><AlertCircle/> {errorMsg}</div>}

                 {/* COMPULSORY SUBJECTS (Locked) */}
                 <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Lock size={14}/> Compulsory Subjects ({currentLevel})</h3>
                   <div className="space-y-3">
                     {compulsorySubjects.map(sub => (
                       <div key={sub} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <div className="col-span-6 font-bold text-slate-700 pl-2">{sub}</div>
                         <div className="col-span-3 text-center text-slate-400 text-xs font-bold uppercase">100 Marks</div>
                         <div className="col-span-3">
                           {/* Spinner Hidden by Tailwind classes */}
                           <input type="number" min="0" max="100" placeholder="-" value={marks[sub] || ""} onChange={(e) => handleMarkChange(sub, e.target.value)} className="w-full bg-white outline-none rounded-lg px-3 py-2 text-sm border border-slate-200 text-center focus:ring-2 focus:ring-[#3ac47d]/50 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* ELECTIVE SUBJECTS (Duplicate Proof) */}
                 {availableElectiveOptions.length > 0 && (
                   <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Elective Subjects (Max 3)</h3>
                     <div className="space-y-3">
                       {[0, 1, 2].map(index => (
                         <div key={index} className="grid grid-cols-12 gap-4 items-center bg-blue-50/30 p-3 rounded-xl border border-blue-50">
                           <div className="col-span-6">
                             <select value={selectedElectives[index]} onChange={(e) => handleElectiveChange(index, e.target.value)} className="w-full bg-white outline-none rounded-lg px-3 py-2 text-sm border border-slate-200 font-bold text-slate-700">
                               <option value="">-- Select Elective --</option>
                               {availableElectiveOptions
                                 .filter(opt => !selectedElectives.includes(opt) || selectedElectives[index] === opt) // MAGIC FILTER
                                 .map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                           </div>
                           <div className="col-span-3 text-center text-slate-400 text-xs font-bold uppercase">100 Marks</div>
                           <div className="col-span-3">
                             <input type="number" disabled={!selectedElectives[index]} min="0" max="100" placeholder="-" value={marks[selectedElectives[index]] || ""} onChange={(e) => handleMarkChange(selectedElectives[index], e.target.value)} className="w-full bg-white outline-none rounded-lg px-3 py-2 text-sm border border-slate-200 text-center focus:ring-2 focus:ring-[#3ac47d]/50 font-bold disabled:opacity-50 disabled:bg-slate-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* 2026 Grading Result Panel */}
                 <div className="bg-[#0F172A] rounded-2xl p-6 text-white mt-6 grid grid-cols-3 gap-4 text-center shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-5"><Calculator size={100} /></div>
                   <div className="relative z-10"><p className="text-[10px] text-slate-400 uppercase tracking-widest">Total</p><p className="text-xl font-black">{calc.obtained} <span className="text-sm font-medium text-slate-500">/ {calc.max}</span></p></div>
                   <div className="relative z-10 border-x border-slate-800"><p className="text-[10px] text-slate-400 uppercase tracking-widest">Percentage</p><p className="text-xl font-black text-blue-400">{calc.percentage}%</p></div>
                   <div className="relative z-10"><p className="text-[10px] text-slate-400 uppercase tracking-widest">2026 Grade</p><p className="text-2xl font-black text-[#3ac47d]">{calc.grade}</p></div>
                 </div>

                 <button disabled={loading} type="submit" className="w-full bg-[#3ac47d] hover:bg-[#2eaa6a] text-white py-4 rounded-xl font-bold flex justify-center gap-2 shadow-md transition-all">
                   {loading ? "Processing..." : "Save Smart Mark Sheet"}
                 </button>
               </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Ledger */}
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
                         <span className={`font-black text-lg ${record.grade === 'U' ? 'text-red-500' : 'text-[#3ac47d]'}`}>{record.percentage}%</span>
                         <p className="text-[10px] font-bold text-slate-400">Grade: {record.grade}</p>
                       </div>
                     </div>
                     <button onClick={() => handleDeleteRecord(record.id)} className="absolute bottom-3 right-3 p-1.5 text-red-500 hover:bg-red-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
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
