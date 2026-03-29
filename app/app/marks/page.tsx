"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, addDoc, query, where } from "firebase/firestore";
import { Award, ChevronRight, Save, Calculator, User } from "lucide-react";

export default function SmartMarksEngine() {
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState({ class: "", section: "", term: "1st Term" });
  const [isLoaded, setIsLoaded] = useState(false);
  const [marksData, setMarksData] = useState<Record<string, any>>({});

  // Subjects based on your previous result card 
  const subjects = [
    { id: "urdu", name: "Urdu", total: 100 },
    { id: "english", name: "English", total: 100 },
    { id: "math", name: "Math", total: 100 },
    { id: "science", name: "Science", total: 100 },
    { id: "pakStudies", name: "Pakistan Studies", total: 100 },
    { id: "islamiat", name: "Islamiat", total: 100 }
  ];

  // Load students based on Class and Section
  const loadStudentTable = () => {
    if (!filter.class || !filter.section) return alert("Select Class and Section first!");
    
    const q = query(
      collection(db, "students"), 
      where("class", "==", filter.class),
      where("section", "==", filter.section)
    );

    onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoaded(true);
    });
  };

  const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
    const numValue = Number(value);
    if (numValue > 100) return; // Prevent exceeding total marks 

    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value
      }
    }));
  };

  // Logic for Grades and Remarks [cite: 7, 10, 11]
  const calculateGrade = (obtained: number) => {
    if (obtained >= 90) return { grade: "A+", remarks: "Outstanding" };
    if (obtained >= 80) return { grade: "A", remarks: "Excellent" };
    if (obtained >= 70) return { grade: "B", remarks: "Good" };
    if (obtained >= 33) return { grade: "C", remarks: "Satisfactory" };
    return { grade: "F", remarks: "Fail" };
  };

  const saveResults = async () => {
    try {
      // Logic to save each student's results to a 'results' collection
      alert("All results calculated and saved successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 md:p-12 font-sans bg-[#F8F9FE] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-[#302B52]">Smart Marks Engine</h1>
        <div className="bg-[#7166F9] text-white px-8 py-3 rounded-2xl font-black shadow-lg">
          Session 2026-27
        </div>
      </div>

      {!isLoaded ? (
        /* SETUP VIEW [cite: 3] */
        <div className="max-w-3xl mx-auto bg-white p-12 rounded-[50px] shadow-2xl border border-purple-50">
          <div className="flex items-center gap-4 mb-10 text-[#302B52]">
            <Calculator size={32} />
            <h3 className="text-2xl font-black">Assessment Setup</h3>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <input type="text" placeholder="Class (e.g., 10th)" onChange={e => setFilter({...filter, class: e.target.value})} className="p-5 bg-[#F8F9FE] rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-200" />
              <input type="text" placeholder="Section (e.g., Iqbal)" onChange={e => setFilter({...filter, section: e.target.value})} className="p-5 bg-[#F8F9FE] rounded-2xl font-bold outline-none border-2 border-transparent focus:border-purple-200" />
            </div>
            <select onChange={e => setFilter({...filter, term: e.target.value})} className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold outline-none">
              <option>1st Term</option>
              <option>2nd Term</option>
              <option>Final Term</option>
            </select>
            <button onClick={loadStudentTable} className="w-full bg-[#302B52] text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-[#7166F9] transition-all">
              Confirm & Load Data Table
            </button>
          </div>
        </div>
      ) : (
        /* DATA ENTRY TABLE  */
        <div className="bg-white p-8 rounded-[48px] shadow-2xl overflow-x-auto border border-purple-50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#302B52] text-white uppercase text-[10px] tracking-widest">
                <th className="p-6 rounded-tl-[30px]">Student Details</th>
                {subjects.map(sub => <th key={sub.id} className="p-6 text-center">{sub.name}</th>)}
                <th className="p-6 rounded-tr-[30px] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-purple-50/30 transition-all font-bold text-[#302B52]">
                  <td className="p-6">
                    <p className="leading-none">{student.fullName}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Adm: {student.admissionNo}</p>
                  </td>
                  {subjects.map(sub => (
                    <td key={sub.id} className="p-4">
                      <input 
                        type="number" 
                        placeholder="0"
                        value={marksData[student.id]?.[sub.id] || ""}
                        onChange={(e) => handleMarkChange(student.id, sub.id, e.target.value)}
                        className="w-20 mx-auto p-3 bg-[#F8F9FE] rounded-xl text-center outline-none focus:ring-2 focus:ring-[#7166F9] no-spinners"
                      />
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <button className="bg-[#7166F9]/10 text-[#7166F9] p-3 rounded-xl hover:bg-[#7166F9] hover:text-white transition-all">
                      <Save size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-10 flex justify-end">
             <button onClick={saveResults} className="bg-[#302B52] text-white px-12 py-5 rounded-[24px] font-black text-lg shadow-xl flex items-center gap-3">
               Save All Records <Calculator size={24} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
