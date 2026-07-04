"use client";
import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Search, Loader2, AlertCircle, FileText, Award, Users, Printer, X } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const fetchResults = async (params: Record<string, string>) => {
  const q = new URLSearchParams(params);
  const res = await apiClient.get(`/results?${q}`);
  return safeArray(res);
};

const TERMS = ["1st Term", "2nd Term", "Final Exams"];

export default function ResultsPage() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(TERMS[2]);
  const [activeReport, setActiveReport] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: classesData = [] } = useClasses();
  const availableClasses = useMemo(() => Array.from(new Set(classesData.map((c: any) => c.classGrade))), [classesData]);
  const availableSections = useMemo(() => classesData.filter((c: any) => c.classGrade === selectedClass).map((c: any) => c.sectionName || c.section), [classesData, selectedClass]);

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ["results", user?.tenantId, selectedClass, selectedSection, selectedTerm],
    queryFn: () => fetchResults({ classGrade: selectedClass, section: selectedSection, term: selectedTerm }),
    enabled: !!user?.tenantId && !!selectedClass && !!selectedSection && !!selectedTerm,
  });

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4"); // A4 Size
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${activeReport.studentName}_Report.pdf`);
  };

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3"><GraduationCap className="text-indigo-600"/> Examination Results</h1>
        <p className="text-sm text-gray-500 mt-1">View, analyze, and generate A4 PDF report cards.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 font-medium">
          <option value="">Select Class</option>
          {availableClasses.map((c: string) => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 font-medium disabled:bg-gray-100">
          <option value="">Select Section</option>
          {availableSections.map((s: string) => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 font-medium">
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-2"><Award size={18}/> Result Ledger</span>
          {results.length > 0 && <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border flex items-center gap-1"><Users size={14}/> {results.length} Students</span>}
        </div>
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400"><Loader2 className="animate-spin text-indigo-500 mb-3" size={32}/><p className="font-medium">Calculating results...</p></div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-500"><AlertCircle size={32} className="mb-3"/><p className="font-medium">Failed to load results.</p></div>
        ) : results.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400"><Search size={32} className="mb-3"/><p className="font-medium">No results found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-600">Roll No</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Student Name</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-center">Total Marks</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-center">Percentage</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-center">Grade</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((row: any) => (
                  <tr key={row.studentId} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">{row.rollNumber}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{row.studentName}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">{row.totalObtained} / {row.totalMax}</td>
                    <td className="px-6 py-4 text-center font-black text-gray-900">{row.percentage}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${row.grade === 'A++' || row.grade === 'A+' || row.grade === 'A' ? 'bg-green-100 text-green-700' : row.grade === 'B' || row.grade === 'C' ? 'bg-blue-100 text-blue-700' : row.grade === 'D' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{row.grade}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
                        <button onClick={() => setActiveReport(row)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                          <FileText size={14}/> View / Print
                        </button>
                      </RequirePermission>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📄 Report Card Modal (A4 PDF & Print Ready) */}
      {activeReport && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-900">Report Card Preview</h2>
              <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><FileText size={16}/> Download A4 PDF</button>
                <button onClick={() => window.print()} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Printer size={16}/> Print</button>
                <button onClick={() => setActiveReport(null)} className="text-gray-400 hover:text-gray-700 p-2"><X size={20} /></button>
              </div>
            </div>
            
            {/* A4 Report Card Content */}
            <div ref={reportRef} className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm', margin: 'auto' }}>
              <div className="border-4 border-indigo-600 rounded-xl p-8">
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-indigo-700">EduPilot School</h1>
                    <p className="text-sm text-gray-500">Excellence in Education</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900">Academic Report</h2>
                    <p className="text-sm text-gray-500">{activeReport.rollNumber} | {selectedTerm}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div><p className="text-xs text-gray-500 uppercase">Student Name</p><p className="text-lg font-bold text-gray-900">{activeReport.studentName}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Class & Section</p><p className="text-lg font-bold text-gray-900">{selectedClass} - {selectedSection}</p></div>
                </div>

                <table className="w-full text-left text-sm mb-8 border border-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 font-bold text-gray-600">Subject</th>
                      <th className="p-3 font-bold text-gray-600 text-center">Obtained Marks</th>
                      <th className="p-3 font-bold text-gray-600 text-center">Total Marks</th>
                      <th className="p-3 font-bold text-gray-600 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeReport.marks?.map((mark: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-gray-800">{mark.subject}</td>
                        <td className="p-3 text-center font-bold text-gray-900">{mark.marksObtained}</td>
                        <td className="p-3 text-center text-gray-600">{mark.totalMarks}</td>
                        <td className="p-3 text-center font-bold text-indigo-600">{mark.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-indigo-50 font-bold">
                    <tr>
                      <td className="p-3 text-gray-900">Total</td>
                      <td className="p-3 text-center text-gray-900">{activeReport.totalObtained}</td>
                      <td className="p-3 text-center text-gray-900">{activeReport.totalMax}</td>
                      <td className="p-3 text-center text-indigo-700">{activeReport.percentage}%</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="grid grid-cols-2 gap-8 mt-12">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-2">Class Teacher's Remarks</p>
                    <div className="border-t-2 border-gray-300 pt-2 min-h-[60px]">
                      <p className="text-sm text-gray-700">{activeReport.marks?.[0]?.teacherComment || "Keep up the good work!"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase mb-2">Principal's Signature</p>
                    <div className="border-t-2 border-gray-300 pt-2 min-h-[60px]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
