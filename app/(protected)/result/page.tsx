// app/(protected)/result/page.tsx
"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap, Search, Loader2, AlertCircle,
  FileText, Award, Users
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

const fetchResults = async (params: Record<string, string>) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/v1/results?${q}`);
  if (!res.ok) throw new Error("Failed to fetch results");
  const json = await res.json();
  return json.data || [];
};

const fetchClasses = async () => {
  const res = await fetch("/api/classes");
  if (!res.ok) throw new Error("Failed to fetch classes");
  const json = await res.json();
  return json.data || [];
};

const TERMS = ["1st Term", "2nd Term", "Final Exams"];

export default function ResultsPage() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(TERMS[2]);

  const { data: classesData = [] } = useQuery({
    queryKey: ["classes", user?.tenantId],
    queryFn: fetchClasses,
    enabled: !!user?.tenantId,
  });

  const availableClasses = useMemo(() => Array.from(new Set(classesData.map((c: any) => c.classGrade))), [classesData]);
  const availableSections = useMemo(() => {
    if (!selectedClass) return [];
    return classesData.filter((c: any) => c.classGrade === selectedClass).map((c: any) => c.sectionName || c.section);
  }, [classesData, selectedClass]);

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ["results", user?.tenantId, selectedClass, selectedSection, selectedTerm],
    queryFn: () => fetchResults({ classGrade: selectedClass, section: selectedSection, term: selectedTerm }),
    enabled: !!user?.tenantId && !!selectedClass && !!selectedSection && !!selectedTerm,
  });

  const handleGeneratePDF = (studentId: string) => {
    const url = `/api/v1/reports/generate?studentId=${studentId}&term=${encodeURIComponent(selectedTerm)}`;
    window.open(url, "_blank");
  };

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <GraduationCap className="text-indigo-600"/> Examination Results
        </h1>
        <p className="text-sm text-gray-500 mt-1">View, analyze, and generate report cards for students.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Class</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Select Class</option>
            {availableClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Section</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium disabled:bg-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="">Select Section</option>
            {availableSections.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-2"><Award size={18}/> Result Ledger</span>
          {results.length > 0 && <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1"><Users size={14}/> {results.length} Students</span>}
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
                        <button onClick={() => handleGeneratePDF(row.studentId)} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
                          <FileText size={14}/> Report Card
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
    </div>
  );
}
