"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Award, Search, Printer, AlertCircle, CheckCircle2,
  X, GraduationCap, Eye, ShieldAlert, Sparkles, BookOpen
} from "lucide-react";
// ❌ NO html2canvas or jsPDF imports!

const EXAM_TERMS = ["1st Term", "2nd Term", "Final Exams", "Monthly Test", "Mock Exams", "SBA"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

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

const generateAIGuidelines = (marks: any[]) => {
  if (!marks || marks.length === 0) return ["No sufficient data for AI analysis."];
  let weakSubjects = marks.filter(m => (m.marksObtained / m.totalMarks) < 0.5).map(m => m.subject);
  let strongSubjects = marks.filter(m => (m.marksObtained / m.totalMarks) >= 0.8).map(m => m.subject);
  let totalObt = marks.reduce((acc, curr) => acc + Number(curr.marksObtained), 0);
  let totalMax = marks.reduce((acc, curr) => acc + Number(curr.totalMarks), 0);
  let percent = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  let guidelines = [];
  if (percent >= 80) guidelines.push(" 🌟  Outstanding overall performance! The student is showing excellent dedication.");
  else if (percent >= 60) guidelines.push(" 📈  Steady progress observed. Consistent revision can help achieve top grades.");
  else guidelines.push(" ⚠️  Needs focused attention. A structured daily study routine is highly recommended.");
  if (weakSubjects.length > 0) guidelines.push(` 📚  Extra practice and tutoring required in: ${weakSubjects.join(", ")}.`);
  else if (strongSubjects.length > 0) guidelines.push(` 🏆  Exceptional grasp and strong conceptual clarity in: ${strongSubjects.slice(0, 3).join(", ")}.`);
  return guidelines;
};

export default function ResultsPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<any[]>([]);
  const [sectionsData, setSectionsData] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState(EXAM_TERMS[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<any | null>(null);
  const [studentSkills, setStudentSkills] = useState<any>(null);
  const [aiComment, setAiComment] = useState("");
  const [generatingComment, setGeneratingComment] = useState(false);

  // 🚀 NEW: Vector PDF Download Handler
  const handleDownloadVectorPDF = async () => {
    if (!selectedStudentForCard) return;
    try {
      const res = await fetch(`/api/reports/generate?studentId=${selectedStudentForCard.id}&term=${encodeURIComponent(selectedTerm)}`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Report_${selectedStudentForCard.name || 'Student'}_${selectedTerm}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (!user?.tenantId) return;
    const unsubStudents = onSnapshot(query(collection(db, "students"), where("tenantId", "==", user.tenantId)), (snap) => setStudentsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubMarks = onSnapshot(query(collection(db, "marks"), where("tenantId", "==", user.tenantId)), (snap) => setMarksData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSections = onSnapshot(query(collection(db, "sections"), where("tenantId", "==", user.tenantId)), (snap) => setSectionsData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubStudents(); unsubMarks(); unsubSections(); };
  }, [user?.tenantId]);

  useEffect(() => {
    if (selectedStudentForCard) {
      fetch(`/api/marks/skills?studentId=${selectedStudentForCard.id}&term=${encodeURIComponent(selectedTerm)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) setStudentSkills(data.data[0]);
          else setStudentSkills(null);
        })
        .catch(() => setStudentSkills(null));
    }
  }, [selectedStudentForCard, selectedTerm]);

  const availableClasses = Array.from(new Set(sectionsData.map(s => s.classGrade)));
  const availableSections = sectionsData.filter(s => norm(s.classGrade) === norm(selectedClass));
  const filteredStudents = studentsData.filter(s => {
    const matchClass = norm(s.classGrade) === norm(selectedClass);
    const matchSec = norm(s.section) === norm(selectedSection);
    const matchSearch = norm(s.name).includes(norm(searchQuery)) || norm(s.rollNumber?.toString()).includes(norm(searchQuery));
    return matchClass && matchSec && (!searchQuery || matchSearch);
  });

  if (!isMounted) return null;

  const handleGenerateComment = async () => {
    if (!selectedStudentForCard) return;
    const studentMarks = marksData.filter(m => m.studentId === selectedStudentForCard.id);
    const termMarks = studentMarks.filter(m => norm(m.term) === norm(selectedTerm));
    if (termMarks.length === 0) return;
    setGeneratingComment(true);
    try {
      const res = await fetch("/api/ai/report-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: selectedStudentForCard.name, marks: termMarks }),
      });
      const data = await res.json();
      setAiComment(data?.comment || "Failed to generate comment.");
    } catch (error) {
      setAiComment("Error generating comment.");
    } finally {
      setGeneratingComment(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-result-card, #printable-result-card * { visibility: visible; }
          #printable-result-card { position: absolute; left: 0; top: 0; width: 100%; height: auto; box-shadow: none !important; border: 2px solid #1e293b; border-radius: 0 !important; margin: 0 !important; padding: 20px !important; background: white !important; color: black !important; }
          .print-hide { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      
      <div className="flex justify-between items-end print-hide">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3"><Award className="text-blue-600"/> Exams & Grading</h1>
          <p className="text-sm text-gray-500 mt-1">Smart Results Generation & Printing Engine.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 print-hide">
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">CONFIGURE RESULT BOARD</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900">
            {EXAM_TERMS.map(term => <option key={term} value={term}>{term}</option>)}
          </select>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900">
            <option value="">-- Select Class --</option>
            {availableClasses.map(cls => <option key={cls as string} value={cls as string}>{cls as string}</option>)}
          </select>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 disabled:opacity-50">
            <option value="">-- Select Section --</option>
            {availableSections.map(sec => <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-3 text-sm font-medium text-gray-900" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden min-h-[400px] print-hide">
        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
           <div><h2 className="text-lg font-black uppercase">{selectedClass || "Select a Class"} - {selectedSection || "Section"}</h2><p className="text-xs text-gray-300 font-medium">Generating results for: <span className="font-bold text-blue-400 uppercase">{selectedTerm}</span></p></div>
        </div>
        <div className="px-6 py-3 grid grid-cols-12 gap-4 bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <div className="col-span-1">Roll</div><div className="col-span-4">Student Details</div><div className="col-span-3 text-center">Status</div><div className="col-span-2 text-center">Score & Grade</div><div className="col-span-2 text-right">Action</div>
        </div>
        {(!selectedClass || !selectedSection) ? (
          <div className="py-20 text-center opacity-40"><Award size={60} className="mx-auto mb-4 text-gray-400" /><h3 className="text-xl font-black text-gray-600">Select Class & Section</h3></div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-20 text-center opacity-40"><h3 className="text-xl font-black text-gray-600">No Students Found</h3></div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.sort((a,b) => (a.rollNumber||0) - (b.rollNumber||0)).map((student) => {
              const studentMarks = marksData.filter(m => m.studentId === student.id);
              const termMarks = studentMarks.filter(m => norm(m.term) === norm(selectedTerm));
              let status = "Pending"; let statusColor = "bg-red-100 text-red-500"; let scoreStr = "-"; let gradeStr = "-"; let isReady = false; let missingPrereqs = false;
              if (norm(selectedTerm) === norm("Final Exams")) {
                const has1st = studentMarks.some(m => norm(m.term) === norm("1st Term"));
                const has2nd = studentMarks.some(m => norm(m.term) === norm("2nd Term"));
                if (!has1st || !has2nd) { missingPrereqs = true; status = "Missing 1st/2nd Term"; statusColor = "bg-orange-100 text-orange-600"; }
              }
              if (termMarks.length > 0) {
                const totalObt = termMarks.reduce((acc, curr) => acc + Number(curr.marksObtained || 0), 0);
                const totalMax = termMarks.reduce((acc, curr) => acc + Number(curr.totalMarks || 0), 0);
                const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
                gradeStr = calculateGrade(totalObt, totalMax); scoreStr = `${pct.toFixed(1)}%`;
                if (!missingPrereqs) { status = "Ready / Generated"; statusColor = "bg-green-100 text-green-600"; isReady = true; }
              }
              return (
                <div key={student.id} className="px-6 py-3 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-1 font-black text-gray-500 text-lg">{student.rollNumber || "-"}</div>
                  <div className="col-span-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-200 border overflow-hidden shrink-0">{student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400"><GraduationCap size={14}/></div>}</div><div><p className="font-bold text-gray-900 text-sm">{student.name}</p><p className="text-[10px] text-gray-500 uppercase">{student.classGrade} - {student.section}</p></div></div>
                  <div className="col-span-3 flex justify-center"><span className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 ${statusColor}`}>{missingPrereqs ? <ShieldAlert size={12}/> : (isReady ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>)}{status}</span></div>
                  <div className="col-span-2 flex justify-center items-center gap-2"><span className="text-xs font-bold text-gray-600">{scoreStr}</span>{gradeStr !== "-" && <span className={`w-8 text-center py-1 rounded-md text-[10px] font-black ${gradeStr === "U" ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{gradeStr}</span>}</div>
                  <div className="col-span-2 flex justify-end"><button onClick={() => setSelectedStudentForCard(student)} disabled={termMarks.length === 0 && !missingPrereqs} className="text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-3
