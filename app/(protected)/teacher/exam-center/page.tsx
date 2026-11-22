"use client";
import React from "react";
import Link from "next/link";
import { FileText, Plus, UploadCloud, ArrowRight, Award, PenTool } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function ExamCenterPage() {
  const activeExamTerms = [
    { term: "Final Exams", classGrade: "Class 10", section: "Section A", status: "Marks Entered", count: "3 Subjects • 1 Student Recorded (Imran Haider #103)" },
    { term: "2nd Term", classGrade: "Class 10", section: "Section A", status: "Scheduled", count: "Active Session" },
    { term: "1st Term", classGrade: "Class 10", section: "Section A", status: "Completed", count: "Archived" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" /> Exam Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage examinations, question papers, and link directly to marks entry.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/marks"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <PenTool size={16} /> Enter Marks
          </Link>
          <Link
            href="/result"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Award size={16} /> View Results
          </Link>
        </div>
      </div>

      <RequirePermission permissions={[PERMISSIONS.exams.create]}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/marks" className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition cursor-pointer group block">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Enter Exam Marks</h2>
            <p className="text-gray-500 text-sm mt-2">Open the marks entry portal to record subject scores.</p>
          </Link>

          <Link href="/exams" className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition cursor-pointer group block">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Exams & Assessment Ledger</h2>
            <p className="text-gray-500 text-sm mt-2">View smart assessment ledgers and publish results.</p>
          </Link>
        </div>
      </RequirePermission>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Active Examination Terms & Ledgers</h2>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Academic Year 2026-2027
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {activeExamTerms.map((exam, idx) => (
            <div key={idx} className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {exam.term} <span className="text-xs font-normal text-gray-500">({exam.classGrade} - {exam.section})</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{exam.count}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  exam.status === "Marks Entered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  exam.status === "Scheduled" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {exam.status}
                </span>
                <Link
                  href={`/exams?class=${encodeURIComponent(exam.classGrade)}&section=${encodeURIComponent(exam.section)}&term=${encodeURIComponent(exam.term)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View Ledger <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
