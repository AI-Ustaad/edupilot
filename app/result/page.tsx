"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { GraduationCap, Printer, Award, MessageSquare, Calendar } from "lucide-react";

function ResultContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id") || "yHNTCMOhOgVzmzwuXNZ7"; // Default from your sample [cite: 12]
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchResult() {
      // In a real app, you'd fetch the specific result doc linked to this studentId
      const docRef = doc(db, "students", studentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setData(snap.data());
    }
    fetchResult();
  }, [studentId]);

  const handlePrint = () => window.print();

  // Mock data based strictly on your uploaded result.pdf [cite: 6, 7, 9, 11]
  const resultData = {
    name: data?.fullName || "Imran Haider Sandhu",
    father: data?.fatherName || "Muhammad Saleem",
    class: data?.class || "10TH IQBAL",
    admNo: data?.admissionNo || "786-1-26",
    subjects: [
      { name: "Urdu", total: 100, obtn: 29, grade: "F", rem: "Fail" },
      { name: "English", total: 100, obtn: 13, grade: "F", rem: "Fail" },
      { name: "Math", total: 100, obtn: 87, grade: "A", rem: "Excellent" },
      { name: "Science", total: 100, obtn: 79, grade: "B", rem: "Good" },
      { name: "Pak Studies", total: 100, obtn: 98, grade: "A+", rem: "Outstanding" },
      { name: "Islamiat", total: 100, obtn: 99, grade: "A+", rem: "Outstanding" },
    ],
    attendance: { total: 30, present: 26, absent: 4 }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:p-0">
      {/* PRINT ACTION BUTTON */}
      <div className="max-w-[800px] mx-auto mb-6 flex justify-end print:hidden">
        <button onClick={handlePrint} className="bg-[#302B52] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-[#7166F9] transition-all">
          <Printer size={20} /> Download & Print Result
        </button>
      </div>

      {/* THE ONE-PAGE CARD */}
      <div className="max-w-[800px] mx-auto bg-white shadow-2xl border-[12px] border-[#302B52] p-8 md:p-12 relative overflow-hidden print:shadow-none print:border-[6px]">
        
        {/* HEADER SECTION [cite: 3, 5] */}
        <div className="flex justify-between items-start border-b-4 border-[#F8F9FE] pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#302B52] p-4 rounded-3xl text-white">
              <GraduationCap size={48} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#302B52] leading-none">EDUPILOT</h1>
              <p className="text-[#7166F9] font-bold text-sm tracking-[3px] mt-1 uppercase">Student Result Card</p>
              <p className="text-gray-400 text-[10px] font-black mt-1">ACADEMIC SESSION 2025-26 [cite: 5]</p>
            </div>
          </div>
          <div className="text-right">
             <div className="w-24 h-24 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[10px] font-bold">
               PHOTO HERE [cite: 1]
             </div>
          </div>
        </div>

        {/* STUDENT INFO GRID [cite: 6] */}
        <div className="grid grid-cols-2 gap-y-4 mb-8 bg-[#F8F9FE] p-6 rounded-[32px]">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</p>
            <p className="text-lg font-black text-[#302B52]">{resultData.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Father's Name</p>
            <p className="text-lg font-black text-[#302B52]">{resultData.father}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class & Section</p>
            <p className="text-lg font-black text-[#302B52]">{resultData.class}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admission No</p>
            <p className="text-lg font-black text-[#302B52]">{resultData.admNo}</p>
          </div>
        </div>

        {/* MARKS TABLE [cite: 7] */}
        <div className="mb-8 rounded-[32px] border-2 border-[#F8F9FE] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#302B52] text-white text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4 px-6">Subject</th>
                <th className="p-4 text-center">Total</th>
                <th className="p-4 text-center">Obtained</th>
                <th className="p-4 text-center">Grade</th>
                <th className="p-4 text-right pr-6">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-[#302B52] font-bold">
              {resultData.subjects.map((sub, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#F8F9FE]"}>
                  <td className="p-4 px-6 border-r border-gray-50">{sub.name}</td>
                  <td className="p-4 text-center border-r border-gray-50">{sub.total}</td>
                  <td className="p-4 text-center border-r border-gray-50">{sub.obtn}</td>
                  <td className="p-4 text-center border-r border-gray-50">
                    <span className={`px-3 py-1 rounded-lg text-xs ${sub.grade === 'F' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {sub.grade}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6 italic text-gray-400 text-xs">{sub.rem} [cite: 7]</td>
                </tr>
              ))}
              <tr className="bg-[#302B52] text-white">
                <td className="p-4 px-6 font-black">TOTAL AGGREGATE</td>
                <td className="p-4 text-center font-black">600</td>
                <td className="p-4 text-center font-black">405</td>
                <td className="p-4 text-center font-black">C [cite: 7]</td>
                <td className="p-4 text-right pr-6 font-black uppercase text-[10px]">Pass [cite: 7]</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ATTENDANCE & AI COMMENTS [cite: 8, 9, 10, 11] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <div className="bg-[#F8F9FE] p-6 rounded-[32px]">
              <h4 className="flex items-center gap-2 text-xs font-black text-[#302B52] uppercase tracking-widest mb-4">
                <Calendar size={16} className="text-[#7166F9]"/> Attendance Record [cite: 8]
              </h4>
              <div className="flex justify-between items-center">
                <div className="text-center bg-white p-3 rounded-2xl flex-1 mr-2 shadow-sm">
                  <p className="text-[10px] text-gray-400 uppercase">Total Days</p>
                  <p className="font-black text-[#302B52] text-lg">{resultData.attendance.total} [cite: 9]</p>
                </div>
                <div className="text-center bg-white p-3 rounded-2xl flex-1 mx-2 shadow-sm border-b-4 border-green-400">
                  <p className="text-[10px] text-gray-400 uppercase">Present</p>
                  <p className="font-black text-green-500 text-lg">{resultData.attendance.present} [cite: 9]</p>
                </div>
                <div className="text-center bg-white p-3 rounded-2xl flex-1 ml-2 shadow-sm border-b-4 border-red-400">
                  <p className="text-[10px] text-gray-400 uppercase">Absent</p>
                  <p className="font-black text-red-500 text-lg">{resultData.attendance.absent} [cite: 9]</p>
                </div>
              </div>
           </div>

           <div className="bg-[#302B52] p-6 rounded-[32px] text-white">
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4">
                <MessageSquare size={16} className="text-[#7166F9]"/> Teacher/AI Observations [cite: 10]
              </h4>
              <p className="text-[11px] leading-relaxed italic opacity-80">
                "Math: Exceptional problem-solving skills! Encourage them with advanced puzzles." [cite: 11]
              </p>
           </div>
        </div>

        {/* SIGNATURE SECTION [cite: 18, 19, 20] */}
        <div className="flex justify-between items-end px-4">
          <div className="text-center">
            <div className="w-32 border-b-2 border-gray-200 mb-2"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Class Teacher [cite: 18]</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b-2 border-gray-200 mb-2"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">Principal / Head [cite: 19]</p>
          </div>
          <div className="text-center">
            <div className="w-32 border-b-2 border-gray-200 mb-2"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Parent/Guardian [cite: 20]</p>
          </div>
        </div>

        {/* FOOTER WATERMARK */}
        <div className="absolute bottom-4 right-8 opacity-10 font-black text-4xl select-none -rotate-12">
          EDUPILOT OFFICIAL
        </div>
      </div>
    </div>
  );
}

export default function ResultCardPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black animate-pulse">GENERATING ELITE RESULT CARD...</div>}>
      <ResultContent />
    </Suspense>
  );
}
