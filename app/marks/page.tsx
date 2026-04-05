"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClipboardEdit, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function MarksEntryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("1st Term");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [marksData, setMarksData] = useState<any[]>([]);

  // 1. Fetch Students Automatically
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "students"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    });
    return () => unsub();
  }, []);

  // 2. Dynamic Subject Generator based on Class
  useEffect(() => {
    if (!selectedClass) {
      setMarksData([]);
      return;
    }

    let subjs: any[] = [];
    const addComp = (name: string) => subjs.push({ id: Math.random(), subject: name, type: "Compulsory", total: 100, obtained: "" });
    const addElective = (options: string[], label: string) => subjs.push({ id: Math.random(), subject: "", type: "Elective", options, label, total: 100, obtained: "" });

    const islamiatOptions = ["Islamiyat", "Religious Education"];

    if (["1", "2", "3"].includes(selectedClass)) {
      ["Urdu", "English", "Mathematics", "General Knowledge", "Nazra Quran"].forEach(addComp);
      addElective(islamiatOptions, "Select Religion Sub");
    } 
    else if (["4", "5"].includes(selectedClass)) {
      ["Urdu", "English", "Mathematics", "General Science", "Social Studies", "Nazra Quran"].forEach(addComp);
      addElective(islamiatOptions, "Select Religion Sub");
    } 
    else if (["6", "7", "8"].includes(selectedClass)) {
      ["Urdu", "English", "Mathematics", "General Science", "History", "Geography", "Computer Education", "Tarjuma-tul-Quran"].forEach(addComp);
      addElective(islamiatOptions, "Select Religion Sub");
      addElective(["Arabic", "Persian", "Punjabi", "Agriculture", "Home Economics", "Fine Arts"], "Select Elective");
    } 
    else if (selectedClass === "9") {
      ["Urdu", "English", "Tarjuma-tul-Quran"].forEach(addComp);
      addElective(islamiatOptions, "Select Religion/Pak Studies");
      addElective(["Mathematics (Science)", "General Mathematics"], "Select Math");
      const highElectives = ["Physics", "Chemistry", "Biology", "Computer Science", "General Science", "Civics", "Economics", "Education", "Advanced Urdu", "Advanced Punjabi"];
      addElective(highElectives, "Elective 1");
      addElective(highElectives, "Elective 2");
      addElective(highElectives, "Elective 3");
    } 
    else if (selectedClass === "10") {
      ["Urdu", "English", "Pakistan Studies", "Tarjuma-tul-Quran"].forEach(addComp);
      addElective(["Mathematics (Science)", "General Mathematics"], "Select Math");
      const highElectives = ["Physics", "Chemistry", "Biology", "Computer Science", "General Science", "Civics", "Economics", "Education", "Advanced Urdu", "Advanced Punjabi"];
      addElective(highElectives, "Elective 1");
      addElective(highElectives, "Elective 2");
      addElective(highElectives, "Elective 3");
    }

    setMarksData(subjs);
  }, [selectedClass]);

  // Handle Mark Inputs
  const handleMarkChange = (id: number, value: string) => {
    // Only allow numbers and empty string
    if (value !== "" && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) return;
    
    setMarksData(marksData.map(m => m.id === id ? { ...m, obtained: value } : m));
  };

  // Handle Elective Selection
  const handleSubjectSelect = (id: number, value: string) => {
    setMarksData(marksData.map(m => m.id === id ? { ...m, subject: value } : m));
  };

  // 3. Save Final Result (Only Filled Subjects)
  const handleSaveResult = async () => {
    if (!selectedStudent) {
      alert("Please select a student first.");
      return;
    }

    // MAGIC FILTER: Only save subjects that have a name AND obtained is NOT empty (allows "0")
    const validMarks = marksData.filter(m => m.subject !== "" && m.obtained !== "");

    if (validMarks.length === 0) {
      alert("Please enter marks for at least one subject.");
      return;
    }

    setLoading(true);
    try {
      let totalMax = 0;
      let totalObt = 0;

      validMarks.forEach(m => {
        totalMax += m.total;
        totalObt += Number(m.obtained);
      });

      const percentage = (totalObt / totalMax) * 100;
      let grade = "F";
      if (percentage >= 80) grade = "A+";
      else if (percentage >= 70) grade = "A";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C";
      else if (percentage >= 40) grade = "D";

      const studentInfo = students.find(s => s.id === selectedStudent);

      const resultPayload = {
        studentId: studentInfo.id,
        studentName: studentInfo.fullName,
        admNo: studentInfo.admNo,
        studentClass: selectedClass,
        term: selectedTerm,
        date: new Date().toISOString(),
        subjects: validMarks, // ONLY SAVING THE FILLED ONES!
        grandTotal: totalMax,
        obtainedTotal: totalObt,
        percentage: percentage.toFixed(2),
        grade: grade
      };

      await addDoc(collection(db, "marks"), resultPayload);
      
      setSuccessMsg("Marks saved successfully! Ready for printing.");
      setTimeout(() => setSuccessMsg(""), 4000);
      
      // Reset inputs but keep class and student for fast entry
      setMarksData(marksData.map(m => ({ ...m, obtained: "" })));
      
    } catch (error) {
      console.error("Error saving marks: ", error);
      alert("Failed to save marks.");
    }
    setLoading(false);
  };

  // Filter students based on selected class
  const classStudents = students.filter(s => s.studentClass === selectedClass);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <div className="bg-[#e8f8f0] p-3 rounded-xl">
          <ClipboardEdit size={32} className="text-[#3ac47d]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Smart Marks Engine</h1>
          <p className="text-gray-500 font-medium mt-1">Dynamic grading system aligned with Pakistan's National Curriculum.</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-200">
          <CheckCircle2 size={20} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* TOP FILTERS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Examination Term</label>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A]">
            <option>1st Term</option>
            <option>2nd Term</option>
            <option>Final Exams</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Class</label>
          <select value={selectedClass} onChange={(e) => {setSelectedClass(e.target.value); setSelectedStudent("");}} className="w-full bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A]">
            <option value="">-- Choose Class --</option>
            {[...Array(10)].map((_, i) => (
              <option key={i+1} value={`${i+1}`}>Class {i+1}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Student</label>
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={!selectedClass} className="w-full bg-gray-50 border border-transparent focus:border-[#3ac47d] outline-none rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] disabled:opacity-50">
            <option value="">-- Choose Student --</option>
            {classStudents.map(s => (
              <option key={s.id} value={s.id}>{s.fullName} (Roll: {s.rollNo || s.admNo})</option>
            ))}
          </select>
        </div>
      </div>

      {/* MARKS ENTRY TABLE */}
      {selectedClass && selectedStudent ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-bold tracking-wide">Enter Marks</h3>
            <span className="text-[#3ac47d] text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} /> Only filled subjects will be saved
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-12 gap-4 mb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-6">Subject Name</div>
              <div className="col-span-3 text-center">Total Marks</div>
              <div className="col-span-3 text-center">Obtained Marks</div>
            </div>

            <div className="space-y-3">
              {marksData.map((subj) => (
                <div key={subj.id} className="grid grid-cols-12 gap-4 items-center bg-gray-50 rounded-xl p-2 hover:bg-gray-100 transition-colors">
                  
                  {/* Subject Name / Selection */}
                  <div className="col-span-6 px-2">
                    {subj.type === "Compulsory" ? (
                      <span className="font-bold text-[#0F172A]">{subj.subject} <span className="text-[10px] ml-2 bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Compulsory</span></span>
                    ) : (
                      <select 
                        value={subj.subject} 
                        onChange={(e) => handleSubjectSelect(subj.id, e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#3ac47d] outline-none rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A]"
                      >
                        <option value="">-- {subj.label} --</option>
                        {subj.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Total Marks (Locked) */}
                  <div className="col-span-3">
                    <input type="text" value={subj.total} readOnly className="w-full text-center bg-transparent border-none text-gray-500 font-bold outline-none" />
                  </div>

                  {/* Obtained Marks (No Spinners, Allow Empty) */}
                  <div className="col-span-3">
                    <input 
                      type="number" 
                      value={subj.obtained} 
                      onChange={(e) => handleMarkChange(subj.id, e.target.value)}
                      placeholder="--"
                      className="w-full text-center bg-white border border-gray-200 focus:border-[#3ac47d] focus:ring-2 focus:ring-[#3ac47d]/20 outline-none rounded-lg py-2 font-bold text-[#0F172A] text-lg transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSaveResult} 
                disabled={loading}
                className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-green-500/30 transition-all flex items-center gap-2"
              >
                {loading ? "Saving Records..." : <><Save size={18} /> Save & Finalize Result</>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <ClipboardEdit size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-400">Select a Class and Student to start entering marks.</h3>
        </div>
      )}
    </div>
  );
}
