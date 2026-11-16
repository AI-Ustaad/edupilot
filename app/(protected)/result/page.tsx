"use client";
import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Search, Loader2, AlertCircle, FileText, Award, Users, Printer, X, Download } from "lucide-react";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";
import { calculateGrade, getGradeBadgeClasses } from "@/lib/utils/grading";
import { downloadStudentReportPDF, downloadAllStudentsReportPDF } from "@/lib/utils/reportCardPdf";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";

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

  const { data: settings } = useSettings();
  const schoolName = settings?.schoolName || (settings as any)?.school?.name || (user as any)?.schoolName || "Government High School Sahiwal";
  const subtitle = settings?.affiliation || "Punjab Government (PCTB) • Academic Session 2025-2026";

  const { data: classesData = [] } = useClasses();
  const availableClasses = useMemo(
    () =>
      Array.from(new Set(classesData.map((c: any) => formatClassLabel(c.classGrade))))
        .filter(Boolean)
        .sort((a: any, b: any) => (parseInt(a.replace(/[^0-9]/g, ""), 10) || 0) - (parseInt(b.replace(/[^0-9]/g, ""), 10) || 0)),
    [classesData]
  );
  const availableSections = useMemo(
    () =>
      Array.from(
        new Set(
          classesData
            .filter((c: any) => formatClassLabel(c.classGrade) === formatClassLabel(selectedClass))
            .map((c: any) => cleanSectionName(c.sectionName || c.section))
        )
      )
        .filter(Boolean)
        .sort(),
    [classesData, selectedClass]
  );

  const { data: rawResults = [], isLoading, error } = useQuery({
    queryKey: ["results", user?.tenantId, selectedClass, selectedSection, selectedTerm],
    queryFn: () => fetchResults({ classGrade: selectedClass, section: selectedSection, term: selectedTerm }),
    enabled: !!user?.tenantId && !!selectedClass && !!selectedSection && !!selectedTerm,
  });

  // Normalize results with canonical grading scale
  const results = useMemo(() => {
    return rawResults.map((row: any) => {
      const marks = (row.marks || []).map((m: any) => {
        const pct = m.percentage ?? (Number(m.totalMarks) > 0 ? (Number(m.marksObtained) / Number(m.totalMarks)) * 100 : 0);
        return {
          ...m,
          grade: calculateGrade(pct),
          percentage: Number(pct),
        };
      });
      const pct = Number(row.percentage) || (Number(row.totalMax) > 0 ? (Number(row.totalObtained) / Number(row.totalMax)) * 100 : 0);
      return {
        ...row,
        marks,
        percentage: pct.toFixed(2),
        grade: calculateGrade(pct),
      };
    });
  }, [rawResults]);

  const handleDownloadDirectPDF = (studentRow: any) => {
    downloadStudentReportPDF(studentRow, {
      schoolName,
      subtitle,
      term: selectedTerm,
      classGrade: selectedClass,
      section: selectedSection,
    });
  };

  const handleDownloadAll = () => {
    if (results.length === 0) return;
    downloadAllStudentsReportPDF(results, {
      schoolName,
      subtitle,
      term: selectedTerm,
      classGrade: selectedClass,
      section: selectedSection,
    });
  };

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <GraduationCap className="text-indigo-600"/> Examination Results
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View, analyze, and generate official A4 PDF report cards.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <select 
          value={selectedClass} 
          onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} 
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 font-medium"
        >
          <option value="">Select Class</option>
          {availableClasses.map((c: string) => (
            <option key={c} value={c}>{formatClassLabel(c)}</option>
          ))}
        </select>
        <select 
          value={selectedSection} 
          onChange={e => setSelectedSection(e.target.value)} 
          disabled={!selectedClass} 
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 font-medium disabled:bg-gray-100"
        >
          <option value="">Select Section</option>
          {availableSections.map((s: string) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
        <select 
          value={selectedTerm} 
          onChange={e => setSelectedTerm(e.target.value)} 
          className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 font-medium"
        >
          {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Result Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2"><Award size={18}/> Result Ledger</span>
            {results.length > 0 && (
              <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border flex items-center gap-1">
                <Users size={14}/> {results.length} Students
              </span>
            )}
          </div>

          {results.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
              title="Download all report cards in one PDF"
            >
              <Download size={14}/> Download All (PDF)
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin text-indigo-500 mb-3" size={32}/>
            <p className="font-medium">Calculating results...</p>
          </div>
        ) : error ? (
          <div className="p-12 flex flex-col items-center justify-center text-red-500">
            <AlertCircle size={32} className="mb-3"/>
            <p className="font-medium">Failed to load results.</p>
          </div>
        ) : !selectedClass || !selectedSection ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Search size={32} className="mb-3"/>
            <p className="font-medium">Select Class and Section above to view results.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Search size={32} className="mb-3"/>
            <p className="font-medium">No results found for {formatClassLabel(selectedClass)} - Section {cleanSectionName(selectedSection)}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-600">Roll No</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Student Name</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Subject Breakdown</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-center">Total Marks</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-center">Percentage</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-center">Grade</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((row: any) => (
                  <tr key={row.studentId} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-700">{row.rollNumber}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{row.studentName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {row.marks?.map((m: any, idx: number) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"
                          >
                            {m.subject}: <span className="font-bold ml-1 text-gray-900">{m.marksObtained}/{m.totalMarks}</span>
                            <span className={`ml-1 px-1 rounded text-[10px] font-bold border ${getGradeBadgeClasses(m.grade)}`}>
                              {m.grade}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">
                      {row.totalObtained} / {row.totalMax}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900">
                      {row.percentage}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeBadgeClasses(row.grade)}`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setActiveReport(row)} 
                          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                          title="View full report card preview"
                        >
                          <FileText size={14}/> View Report Card
                        </button>
                        <button 
                          onClick={() => handleDownloadDirectPDF(row)} 
                          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-gray-300"
                          title="Download PDF directly"
                        >
                          <Download size={14}/> PDF
                        </button>
                      </div>
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
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600"/> Report Card Preview
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDownloadDirectPDF(activeReport)} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Download size={16}/> Download A4 PDF
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-300 transition"
                >
                  <Printer size={16}/> Print
                </button>
                <button 
                  onClick={() => setActiveReport(null)} 
                  className="text-gray-400 hover:text-gray-700 p-2 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* A4 Report Card Visual Container */}
            <div ref={reportRef} className="p-8 bg-white max-h-[75vh] overflow-y-auto">
              <div className="border-4 border-indigo-900 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-center border-b-2 border-indigo-100 pb-5 mb-8">
                  <div>
                    <h1 className="text-2xl font-black text-indigo-900">{schoolName}</h1>
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black uppercase px-3 py-1 rounded-full mb-1">
                      {selectedTerm}
                    </span>
                    <p className="text-xs text-gray-400 font-mono">Academic Session 2025-2026</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-bold">Student Name</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{activeReport.studentName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-bold">Roll Number</p>
                    <p className="text-base font-bold text-indigo-600 font-mono mt-0.5">{activeReport.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-bold">Class & Section</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">
                      {formatClassLabel(selectedClass)} - Section {cleanSectionName(selectedSection)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase font-bold">Result Status</p>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">
                      {Number(activeReport.percentage) >= 50 ? "PASS" : "FAIL"}
                    </p>
                  </div>
                </div>

                <table className="w-full text-left text-sm mb-8 border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-indigo-900 text-white">
                    <tr>
                      <th className="p-3.5 font-bold">Subject</th>
                      <th className="p-3.5 font-bold text-center">Marks Obtained</th>
                      <th className="p-3.5 font-bold text-center">Total Marks</th>
                      <th className="p-3.5 font-bold text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeReport.marks?.map((mark: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="p-3.5 font-medium text-gray-900">{mark.subject}</td>
                        <td className="p-3.5 text-center font-bold text-gray-900">{mark.marksObtained}</td>
                        <td className="p-3.5 text-center text-gray-500">{mark.totalMarks}</td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${getGradeBadgeClasses(mark.grade)}`}>
                            {mark.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-indigo-50/70 border-t-2 border-indigo-200 font-bold">
                    <tr>
                      <td className="p-3.5 text-indigo-950">Grand Total</td>
                      <td className="p-3.5 text-center text-indigo-950 font-black">{activeReport.totalObtained}</td>
                      <td className="p-3.5 text-center text-indigo-950 font-black">{activeReport.totalMax}</td>
                      <td className="p-3.5 text-center text-indigo-950 font-black">
                        {activeReport.percentage}% ({activeReport.grade})
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="grid grid-cols-2 gap-8 mt-10 pt-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">Class Teacher&apos;s Remarks</p>
                    <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-3 min-h-[60px]">
                      <p className="text-xs text-gray-700 italic">
                        {activeReport.marks?.[0]?.teacherComment || "Excellent performance. Demonstrated thorough subject comprehension and consistent academic dedication."}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end items-end text-right">
                    <div className="w-48 border-b-2 border-gray-400 pb-1 mb-1"></div>
                    <p className="text-xs font-bold text-gray-700">Principal / Headmaster</p>
                    <p className="text-[10px] text-gray-400">Official Seal & Signature</p>
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
