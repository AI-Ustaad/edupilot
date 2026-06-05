"use client";

import { Wallet, AlertTriangle, Receipt, CreditCard } from "lucide-react";

interface FeeStats {
  totalDue: number;
  paid: number;
  outstanding: number;
  overdueMonths: number;
}

export default function FeeSummaryCard({ stats }: { stats?: FeeStats }) {
  // Mock Data
  const data = stats || { totalDue: 45000, paid: 30000, outstanding: 15000, overdueMonths: 1 };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Wallet className="text-blue-500" /> Fee Intelligence
        </h2>
        {data.overdueMonths > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 animate-pulse">
            <AlertTriangle size={12} /> {data.overdueMonths} Month Overdue
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Receipt size={12}/> Total Paid</p>
          <p className="text-xl font-black text-emerald-600">Rs {data.paid.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl border border-red-100 bg-red-50">
          <p className="text-xs font-bold text-red-400 uppercase mb-1 flex items-center gap-1"><CreditCard size={12}/> Outstanding</p>
          <p className="text-xl font-black text-red-600">Rs {data.outstanding.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span className="text-slate-500">Collection Progress</span>
          <span className="text-blue-600 font-bold">{Math.round((data.paid / data.totalDue) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(data.paid / data.totalDue) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
}
