"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
import { 
  TrendingUp, TrendingDown, Landmark, Receipt, 
  Wallet, FileText, PieChart, PlusCircle, Building2 
} from "lucide-react";

export default function FinancialLedger() {
  const [isGovtMode, setIsGovtMode] = useState(false);
  const [activeTab, setActiveTab] = useState("Private"); // Private, NSB, FTF
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    const q = query(collection(db, "ledger"), orderBy("date", "desc"));
    return onSnapshot(q, (snap) => {
      let inc = 0, exp = 0;
      const list = snap.docs.map(doc => {
        const data = doc.data();
        if (data.type === "Income") inc += Number(data.amount);
        else exp += Number(data.amount);
        return { id: doc.id, ...data };
      });
      setTransactions(list);
      setSummary({ income: inc, expense: exp });
    });
  }, []);

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      {/* HEADER & MODE TOGGLE */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#302B52]">Financial Ledger</h1>
          <p className="text-[#7166F9] font-bold text-xs uppercase tracking-[4px] mt-1">Accounts & Audit Management</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-[24px] shadow-xl border border-purple-50">
          <button 
            onClick={() => {setIsGovtMode(false); setActiveTab("Private")}}
            className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${!isGovtMode ? 'bg-[#302B52] text-white shadow-lg' : 'text-gray-400'}`}
          >
            PRIVATE SECTOR
          </button>
          <button 
            onClick={() => setIsGovtMode(true)}
            className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${isGovtMode ? 'bg-[#7166F9] text-white shadow-lg' : 'text-gray-400'}`}
          >
            GOVT / ADOPTED
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-t-[10px] border-green-400">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
          <h2 className="text-4xl font-black text-[#302B52]">Rs. {summary.income}</h2>
          <TrendingUp className="text-green-400 mt-2" size={20} />
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-t-[10px] border-red-400">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Expenses</p>
          <h2 className="text-4xl font-black text-[#302B52]">Rs. {summary.expense}</h2>
          <TrendingDown className="text-red-400 mt-2" size={20} />
        </div>
        <div className="bg-[#302B52] p-8 rounded-[40px] shadow-2xl text-white">
          <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-2">Net Balance</p>
          <h2 className="text-4xl font-black text-white text-shadow">Rs. {summary.income - summary.expense}</h2>
          <Landmark className="text-[#7166F9] mt-2" size={20} />
        </div>
      </div>

      {/* SUB-TABS FOR GOVT MODE */}
      {isGovtMode && (
        <div className="flex gap-4 mb-8">
          {["Private", "NSB Record", "FTF Record"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl font-black text-sm border-2 transition-all ${
                activeTab === tab ? 'bg-white border-[#7166F9] text-[#7166F9] shadow-md' : 'bg-transparent border-transparent text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
        {/* ADD ENTRY FORM */}
        <div className="xl:col-span-2 bg-white/90 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white h-fit">
          <h3 className="text-xl font-black text-[#302B52] mb-8 flex items-center gap-3">
            <PlusCircle className="text-[#7166F9]" /> New Entry ({activeTab})
          </h3>
          <form className="space-y-6">
            <select className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-purple-100">
              <option>Income (Cash In)</option>
              <option>Expense (Cash Out)</option>
            </select>
            
            <input type="text" placeholder="Description (e.g. Electricity Bill)" className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Amount (Rs.)" className="p-5 bg-[#302B52] text-white rounded-2xl font-bold text-sm outline-none shadow-lg" />
              <input type="date" className="p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>

            <select className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
              <option>Select Category...</option>
              {activeTab === "Private" ? (
                <>
                  <option>Staff Salaries</option>
                  <option>Utility Bills</option>
                  <option>Rent / Building</option>
                  <option>Marketing</option>
                </>
              ) : activeTab === "NSB Record" ? (
                <>
                  <option>Infrastructure Repair</option>
                  <option>Stationery/Consumables</option>
                  <option>Library/Sports</option>
                </>
              ) : (
                <>
                  <option>Exam Expenses</option>
                  <option>School Security</option>
                  <option>Contingencies</option>
                </>
              )}
            </select>

            <button className="w-full bg-[#7166F9] text-white py-6 rounded-[30px] font-black text-xl shadow-2xl hover:scale-[1.02] transition-all">
              Save Ledger Entry
            </button>
          </form>
        </div>

        {/* RECENT TRANSACTIONS TABLE */}
        <div className="xl:col-span-3 bg-white/60 backdrop-blur-md p-10 rounded-[50px] shadow-sm border border-purple-50">
          <h3 className="text-2xl font-black text-[#302B52] mb-8">Transaction History</h3>
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map(t => (
              <div key={t.id} className="p-6 bg-white rounded-[32px] flex items-center justify-between shadow-sm border border-transparent hover:border-purple-100 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                    t.type === 'Income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                  }`}>
                    {t.type === 'Income' ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <p className="font-black text-[#302B52] leading-tight">{t.description}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category} | {t.date}</p>
                  </div>
                </div>
                <p className={`text-lg font-black ${t.type === 'Income' ? 'text-green-500' : 'text-[#302B52]'}`}>
                  {t.type === 'Income' ? '+' : '-'} Rs. {t.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
