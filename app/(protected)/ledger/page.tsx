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
      fetchTransactions();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      setErrorMsg("Failed to save entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black dark:text-gray-900">Financial Ledger</h1>
        <p className="text-slate-500 dark:text-slate-400">Accounts & Audit Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`Rs. ${summary.income.toLocaleString()}`} icon={<TrendingUp size={24} />} color="success" />
        <StatCard title="Total Expenses" value={`Rs. ${summary.expense.toLocaleString()}`} icon={<TrendingDown size={24} />} color="danger" />
        <StatCard title="Net Balance" value={`Rs. {(summary.income - summary.expense).toLocaleString()}`} icon={<Landmark size={24} />} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><PlusCircle size={20} /> New Entry</h2>
          {successMsg && (
            <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <select name="type" required className="w-full border rounded-xl p-3 bg-slate-50 dark:bg-slate-700">
              <option value="Income">Income (Cash In)</option>
              <option value="Expense">Expense (Cash Out)</option>
            </select>
            <input type="text" name="description" required placeholder="Description (e.g. Electricity Bill)" className="w-full border rounded-xl p-3" />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" name="amount" required placeholder="Amount (Rs.)" className="w-full border rounded-xl p-3" />
              <input type="date" name="date" required className="w-full border rounded-xl p-3" />
            </div>
            <select name="category" required className="w-full border rounded-xl p-3">
              <option value="Staff Salaries">Staff Salaries</option>
              <option value="Utility Bills">Utility Bills</option>
              <option value="Rent / Building">Rent / Building</option>
              <option value="Marketing">Marketing</option>
              <option value="Contingencies">Contingencies / Others</option>
            </select>
            <button type="submit" disabled={isSaving} className="w-full bg-primary-600 text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Save Ledger Entry"}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-center text-slate-400 py-10">No transactions yet.</p>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 border rounded-xl bg-slate-50 dark:bg-slate-700">
                  <div>
                    <p className="font-bold">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.category} | {t.date}</p>
                  </div>
                  <p className={`font-bold ${t.type === "Income" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "Income" ? "+" : "-"} Rs. {Number(t.amount).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colors = {
    primary: "bg-primary-100 text-primary-700",
    success: "bg-success-100 text-success-700",
    danger: "bg-danger-100 text-danger-700",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-5">
      <div className="flex justify-between items-start">
        <div><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold">{value}</p></div>
        <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>{icon}</div>
      </div>
    </div>
  );
}
