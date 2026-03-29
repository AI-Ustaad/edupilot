"use client";
import React from "react";
import { Wallet, TrendingUp, TrendingDown, PieChart } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="p-10 bg-[#F8F9FE] min-h-screen">
      <h1 className="text-3xl font-black text-[#302B52] mb-10">Financial Accounts</h1>
      
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[40px] shadow-sm border-l-[12px] border-green-400">
           <TrendingUp className="text-green-400 mb-4" />
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Revenue</p>
           <h3 className="text-4xl font-black text-[#302B52]">Rs. 0</h3>
        </div>
        <div className="bg-white p-10 rounded-[40px] shadow-sm border-l-[12px] border-red-400">
           <TrendingDown className="text-red-400 mb-4" />
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Expenses</p>
           <h3 className="text-4xl font-black text-[#302B52]">Rs. 0</h3>
        </div>
        <div className="bg-white p-10 rounded-[40px] shadow-sm border-l-[12px] border-[#7166F9]">
           <PieChart className="text-[#7166F9] mb-4" />
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Net Profit</p>
           <h3 className="text-4xl font-black text-[#302B52]">Rs. 0</h3>
        </div>
      </div>
    </div>
  );
}
