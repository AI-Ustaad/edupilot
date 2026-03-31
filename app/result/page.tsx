"use client";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { GraduationCap, Award, Calendar, MessageSquare, Printer } from "lucide-react";

export default function ResultCard({ student, marks, attendance }) {
  const componentRef = useRef();
  
  // PDF/Print Trigger
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${student.fullName}_Result_Card`,
  });

  const totalObtained = Object.values(marks).reduce((a, b) => Number(a) + Number(b), 0);
  const totalPossible = 600; // Based on 6 subjects 
  const overallPercentage = ((totalObtained / totalPossible) * 100).toFixed(2);

  return (
    <div className="p-10 bg-gray-50 min-h-screen flex flex-col items-center">
      {/* ACTION BAR */}
      <div className="w-full max-w-[800px] mb-6 flex justify-end">
        <button onClick={handlePrint} className="bg-[#302B52] text-white px-10 py-4 rounded-2xl font-black shadow-xl flex items-center gap-3 hover:bg-[#7166F9] transition-all">
          <Printer size={20} /> Print or Save as PDF
        </button>
      </div>

      {/* ONE-PAGE RESULT SHEET  */}
      <div ref={componentRef} className="w-[800px] bg-white border-[10px] border-[#302B52] p-12 shadow-2xl relative overflow-hidden print:border-[5px] print:shadow-none">
        
        {/* HEADER: Institutional Identity [cite: 3, 5] */}
        <div className="flex justify-between items-center border-b-4 border-gray-50 pb-8 mb-8">
          <div className="flex items-center gap-5">
            <div className="bg-[#302B52] p-5 rounded-[30px] text-white shadow-lg">
              <GraduationCap size={50} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#302B52] tracking-tighter">EDUPILOT</h1>
              <p className="text-[#7166F9] font-black text-sm uppercase tracking-[4px]">Student Result Card</p>
              <p className="text-gray-400 text-[10px] font-bold mt-1">FIRST TERM EXAMINATION 2026 [cite: 5]</p>
            </div>
          </div>
          <div className="w-28 h-28 bg-[#F8F9FE] rounded-3xl border-2 border-dashed border-purple-100 flex items-center justify-center text-gray-300 text-[10px] font-black uppercase text-center p-4">
             Student Photo
          </div>
        </div>

        {/* STUDENT INFO [cite: 6] */}
        <div className="grid grid-cols-2 gap-6 mb-8 bg-[#F8F9FE] p-8 rounded-[40px]">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</p>
            <p className="text-xl font-black text-[#302B52]">{student.fullName || "Imran Haider Sandhu"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Father's Name</p>
            <p className="text-xl font-black text-[#302B52]">{student.fatherName || "Muhammad Saleem"}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class / Section</p>
            <p className="text-xl font-black text-[#302B52]">{student.class} - {student.section}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admission No</p>
            <p className="text-xl font-black text-[#302B52]">{student.admissionNo || "786-1-26"}</p>
          </div>
        </div>

        {/* MARKS TABLE  */}
        <div className="rounded-[35px] border-2 border-gray-50 overflow-hidden mb-8">
          <table className="w-full text-left">
            <thead className="bg-[#302B52] text-white text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-5">Subject</th>
                <th className="p-5 text-center">Total</th>
                <th className="p-5 text-center">Obtained</th>
                <th className="p-5 text-center">Grade</th>
                <th className="p-5 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-[#302B52] font-bold">
              {/* This maps your subjects like Urdu, Math, etc.  */}
              <tr className="border-b border-gray-50">
                <td className="p-5">Mathematics</td>
                <td className="p-5 text-center">100</td>
                <td className="p-5 text-center">{marks.math}</td>
                <td className="p-5 text-center text-green-500">A</td>
                <td className="p-5 text-right italic text-gray-400 text-xs">Excellent </td>
              </tr>
              {/* TOTAL ROW */}
              <tr className="bg-[#302B52] text-white">
                <td className="p-5 font-black uppercase">Grand Total </td>
                <td className="p-5 text-center font-black">{totalPossible}</td>
                <td className="p-5 text-center font-black">{totalObtained}</td>
                <td className="p-5 text-center font-black">{overallPercentage}%</td>
                <td className="p-5 text-right font-black uppercase text-[10px]">Result: Pass</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ATTENDANCE & AI INSIGHTS [cite: 8, 10] */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-[#F8F9FE] p-6 rounded-[35px] border border-purple-50">
            <h4 className="flex items-center gap-2 text-xs font-black text-[#302B52] uppercase mb-4">
              <Calendar size={16} className="text-[#7166F9]"/> Attendance Record [cite: 8]
            </h4>
            <div className="flex justify-between font-black text-[#302B52]">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">Total</p>
                <p className="text-xl">30 [cite: 9]</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">Present</p>
                <p className="text-xl text-green-500">26 [cite: 9]</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase">Absent</p>
                <p className="text-xl text-red-500">4 [cite: 9]</p>
              </div>
            </div>
          </div>
          <div className="bg-[#302B52] p-6 rounded-[35px] text-white shadow-xl relative overflow-hidden">
            <h4 className="flex items-center gap-2 text-xs font-black uppercase mb-4">
              <MessageSquare size={16} className="text-[#7166F9]"/> Teacher Recommendations [cite: 10]
            </h4>
            <p className="text-[11px] leading-relaxed italic opacity-80">
              "Math: Exceptional problem-solving skills! Encourage advanced puzzles." [cite: 11]
            </p>
          </div>
        </div>

        {/* SIGNATURES [cite: 18, 19, 20] */}
        <div className="flex justify-between items-end px-4 mt-4">
          <div className="text-center">
            <div className="w-32 border-b-2 border-gray-100 mb-2"></div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Class Teacher [cite: 18]</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b-2 border-[#302B52] mb-2"></div>
            <p className="text-[9px] font-black text-[#302B52] uppercase tracking-[3px]">Principal [cite: 19]</p>
          </div>
          <div className="text-center">
            <div className="w-32 border-b-2 border-gray-100 mb-2"></div>
            <p className="text-[9px] font-black text-gray-400 uppercase">Parent [cite: 20]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
