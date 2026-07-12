"use client";

import { TrendingUp, UserCheck, CalendarX2, Clock } from "lucide-react";

interface AttendanceStats {
  percentage: number;
  present: number;
  absent: number;
  late: number;
  trend: "up" | "down" | "stable";
}

export default function AttendanceCard({ stats }: { stats?: AttendanceStats }) {
  if (!stats) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col items-center justify-center">
        <UserCheck className="text-slate-300 mb-2" size={32} />
        <p className="text-slate-400 text-sm font-medium">No attendance data available</p>
      </div>
    );
  }

  const data = stats;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <UserCheck className="text-emerald-500" /> Attendance Intelligence
        </h2>
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${data.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          <TrendingUp size={12} className={data.trend === 'down' ? 'rotate-180' : ''} /> 
          {data.trend === 'up' ? '+2.4%' : '-1.2%'}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className={`${data.percentage >= 75 ? 'text-emerald-500' : 'text-amber-500'}`} strokeDasharray={`${data.percentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-800">{data.percentage}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1"><UserCheck size={14} className="text-emerald-500"/> Present</span>
            <span className="font-bold text-slate-800">{data.present} Days</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1"><CalendarX2 size={14} className="text-red-500"/> Absent</span>
            <span className="font-bold text-slate-800">{data.absent} Days</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1"><Clock size={14} className="text-amber-500"/> Late</span>
            <span className="font-bold text-slate-800">{data.late} Days</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500 font-medium">Status: <span className={data.percentage >= 75 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{data.percentage >= 75 ? 'Excellent regular attendance' : 'Needs attention'}</span></p>
      </div>
    </div>
  );
}
