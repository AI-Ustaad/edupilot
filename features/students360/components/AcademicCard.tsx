"use client";

import { GraduationCap, Award, BookOpen, AlertCircle } from "lucide-react";

export default function AcademicCard() {
  // Mock Data
  const data = {
    gpa: "A",
    percentage: 86.5,
    rank: "5th",
    topSubject: "Mathematics",
    weakSubject: "Physics"
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <GraduationCap className="text-purple-500" /> Academic Intelligence
        </h2>
        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
          Rank {data.rank}
        </span>
      </div>

      <div className="flex items-center gap-8 mb-6">
        <div className="text-center">
          <span className="block text-4xl font-black text-slate-800">{data.gpa}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">Grade</span>
        </div>
        <div className="w-px h-12 bg-slate-100"></div>
        <div className="text-center">
          <span className="block text-4xl font-black text-purple-600">{data.percentage}%</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">Score</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <Award className="text-emerald-500 mt-0.5" size={16} />
          <div>
            <span className="block text-[10px] font-bold text-emerald-600 uppercase mb-0.5">Top Subject</span>
            <span className="text-sm font-bold text-slate-800">{data.topSubject}</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <AlertCircle className="text-amber-500 mt-0.5" size={16} />
          <div>
            <span className="block text-[10px] font-bold text-amber-600 uppercase mb-0.5">Needs Focus</span>
            <span className="text-sm font-bold text-slate-800">{data.weakSubject}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
