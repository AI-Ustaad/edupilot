"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Landmark, PlusCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function FinancialLedger() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch transactions from secure API
  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/ledger", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        let inc = 0, exp = 0;
        const list = data.map((item: any) => {
          if (item.type === "Income") inc += Number(item.amount);
          else exp += Number(item.amount);
          return item;
        });
        setTransactions(list);
        setSummary({ income: inc, expense: exp });
      }
    } catch (err) {
      console.error("Failed to fetch ledger", err);
      setErrorMsg("Could not load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        type: String(formData.get("type")),
        description: String(formData.get("description")),
        amount: Number(formData.get("amount") || 0),
        date: String(formData.get("date")),
        category: String(formData.get("category")),
      };
      
      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Save failed");
      
      setSuccessMsg("Entry saved successfully!");
      e.currentTarget.reset();
      fetchTransactions(); // refresh list
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" size={32}/></div>;

  return (
    <div className="p-8 md:p-12 font-sans bg-gradient-to-br from-[#F8F9FE] to-[#F1F0FF] min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#302B52]">Financial Ledger</h1>
          <p className="text-[#7166F9] font-bold text-xs uppercase tracking-[4px] mt-1">Accounts & Audit Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-t-[10px] border-green-400">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
          <h2 className="text-4xl font-black text-[#302B52]">Rs. {summary.income.toLocaleString()}</h2>
          <TrendingUp className="text-green-400 mt-2" size={20} />
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border-t-[10px] border-red-400">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Expenses</p>
          <h2 className="text-4xl font-black text-[#302B52]">Rs. {summary.expense.toLocaleString()}</h2>
          <TrendingDown className="text-red-400 mt-2" size={20} />
        </div>
        <div className="bg-[#302B52] p-8 rounded-[40px] shadow-2xl text-gray-900">
          <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-2">Net Balance</p>
          <h2 className="text-4xl font-black text-gray-900">Rs. {(summary.income - summary.expense).toLocaleString()}</h2>
          <Landmark className="text-[#7166F9] mt-2" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
        <div className="xl:col-span-2 bg-white/90 backdrop-blur-xl p-10 rounded-[50px] shadow-2xl border border-white h-fit">
          <h3 className="text-xl font-black text-[#302B52] mb-6 flex items-center gap-3">
            <PlusCircle className="text-[#7166F9]" /> New Entry
          </h3>
          {successMsg && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 border border-green-100 font-bold">
              <CheckCircle2 size={20} /> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 border border-red-100 font-bold">
              <AlertCircle size={20} /> {errorMsg}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <select name="type" required className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-purple-100">
              <option value="Income">Income (Cash In)</option>
              <option value="Expense">Expense (Cash Out)</option>
            </select>
            <input type="text" name="description" required placeholder="Description (e.g. Electricity Bill)" className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="amount" required placeholder="Amount (Rs.)" className="p-5 bg-[#302B52] text-gray-900 rounded-2xl font-bold text-sm outline-none shadow-lg" />
              <input type="date" name="date" required className="p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none" />
            </div>
            <select name="category" required className="w-full p-5 bg-[#F8F9FE] rounded-2xl font-bold text-sm outline-none">
              <option value="Staff Salaries">Staff Salaries</option>
              <option value="Utility Bills">Utility Bills</option>
              <option value="Rent / Building">Rent / Building</option>
              <option value="Marketing">Marketing</option>
              <option value="Contingencies">Contingencies / Others</option>
            </select>
            <button type="submit" disabled={isSaving} className="w-full bg-[#7166F9] flex justify-center items-center gap-2 text-gray-900 py-6 rounded-[30px] font-black text-xl shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="animate-spin" size={24}/> : "Save Ledger Entry"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-3 bg-white/60 backdrop-blur-md p-10 rounded-[50px] shadow-sm border border-purple-50">
          <h3 className="text-2xl font-black text-[#302B52] mb-8">Transaction History</h3>
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.length === 0 ? <p className="text-slate-400 font-bold text-center py-10">No transactions yet.</p> : transactions.map(t => (
              <div key={t.id} className="p-6 bg-white rounded-[32px] flex items-center justify-between shadow-sm border border-transparent hover:border-purple-100 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${t.type === 'Income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                    {t.type === 'Income' ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <p className="font-black text-[#302B52] leading-tight">{t.description}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category} | {t.date}</p>
                  </div>
                </div>
                <p className={`text-lg font-black ${t.type === 'Income' ? 'text-green-500' : 'text-[#302B52]'}`}>
                  {t.type === 'Income' ? '+' : '-'} Rs. {Number(t.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
