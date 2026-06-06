"use client";

import { User, CheckCircle2, AlertCircle } from "lucide-react";
import { StudentProfile } from "../types/student360.types";

interface StudentHeaderProps {
  student: StudentProfile;
  healthScore: number;
}

export default function StudentHeader({ student, healthScore }: StudentHeaderProps) {
  const getHealthColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-500 bg-amber-50 border-amber-200";
    return "text-red-500 bg-red-50 border-red-200";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2" />
      
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200 shadow-sm overflow-hidden">
            {/* 🚀 Changed profileImage to photoBase64 */}
            {student.photoBase64 ? (
              <img src={student.photoBase64} alt={student.fullName || "Student"} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-blue-500" />
            )}
          </div>
          <div className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 shadow-sm ${student.status === 'Active' ? 'bg-white text-emerald-600 border-emerald-200' : 'bg-white text-red-600 border-red-200'}`}>
            {student.status === 'Active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {student.status || 'Active'}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {/* 🚀 Changed firstName/lastName to fullName */}
                {student.fullName}
                <span className="text-sm font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                  {student.rollNumber}
                </span>
              </h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
                {/* 🚀 Changed class to classGrade */}
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">Class {student.classGrade} {student.section ? `- ${student.section}` : ''}</span>
                <span className="text-slate-300">•</span>
                <span>Admitted: {student.admissionDate || "N/A"}</span>
              </p>
            </div>

            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[120px] ${getHealthColor(healthScore)}`}>
              <span className="text-sm font-bold uppercase tracking-wider mb-1 opacity-80">Health Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{healthScore}</span>
                <span className="text-sm font-bold opacity-70">/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
