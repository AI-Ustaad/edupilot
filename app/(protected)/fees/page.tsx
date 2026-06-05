"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { Wallet, CheckCircle2, AlertCircle, Search, Loader2, Receipt, CreditCard } from "lucide-react";

export default function FeesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [onlinePaymentLoading, setOnlinePaymentLoading] = useState<string | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    rollNumber: "",
    classGrade: "",
    feeMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    amountPaid: "",
    paymentMethod: "Cash",
    remarks: ""
  });

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stuRes = await fetch("/api/students", { credentials: "include" });
      if (stuRes.ok) {
        const stuData = await stuRes.json();
        setStudents(Array.isArray(stuData) ? stuData : []);
      }

      const feeRes = await fetch("/api/fees", { credentials: "include" });
      if (feeRes.ok) {
        const result = await feeRes.json();
        // result can be array directly or { success: true, data: [...] }
        const txData = result?.success ? result.data : result;
        setTransactions(Array.isArray(txData) ? txData : []);
      } else {
        console.error("Fees API failed:", feeRes.status);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Data Fetch Error:", error);
      setTransactions([]);
    }
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const student = students.find(s => s.id === e.target.value);
    if (student) {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.name || student.fullName || "",
        rollNumber: student.rollNumber || "",
        classGrade: `${student.classGrade || ""} ${student.section ? `- ${student.section}` : ""}`
      });
    } else {
      setFormData({ ...formData, studentId: "", studentName: "", rollNumber: "", classGrade: "" });
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return setErrorMsg("Please select a student first.");

    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to save transaction.");

      setSuccess(true);
      setFormData(prev => ({ ...prev, amountPaid: "", remarks: "" }));
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg("Error processing payment. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async (transaction: any) => {
    setOnlinePaymentLoading(transaction.id);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: transaction.amountPaid,
          studentId: transaction.studentId,
          month: transaction.feeMonth,
          transactionId: transaction.id
        }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment gateway not configured yet (demo mode).");
      }
    } catch (err) {
      alert("Online payment failed.");
    } finally {
      setOnlinePaymentLoading(null);
    }
  };

  // Safe date conversion helper
  const formatTransactionDate = (t: any) => {
    try {
      if (t.createdAt?.toDate) return t.createdAt.toDate().toLocaleString();
      if (t.timestamp) return new Date(t.timestamp).toLocaleString();
      return new Date().toLocaleString();
    } catch {
      return "N/A";
    }
  };

  if (!isMounted) return null;

  const filteredTransactions = transactions.filter(t =>
    t.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.rollNumber?.toString().includes(searchTerm)
  );

  const totalCollected = transactions.reduce((sum, t) => sum + (Number(t.amountPaid) || 0), 0);

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 md:p-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight uppercase flex items-center gap-2">
            <Wallet className="text-warning" size={28} /> Fee Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Process payments & generate receipts</p>
        </div>
        <div className="bg-warning/20 text-warning px-4 py-2 rounded-xl font-black uppercase text-sm">
          Total Collected: Rs {totalCollected.toLocaleString()}
        </div>
      </div>

      {success && (
        <div className="bg-success/20 text-success p-4 rounded-xl flex items-center gap-3 font-bold uppercase animate-fade-in-down w-full">
          <CheckCircle2 size={20} /> Payment processed successfully!
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 font-bold uppercase animate-fade-in-down w-full">
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* New Payment Form */}
        <div className="lg:col-span-1 glass-card p-6 h-fit">
          <div className="flex items-center gap-2 mb-6 border-b border-white/20 pb-4">
            <CreditCard className="text-slate-400" size={20} />
            <h2 className="text-lg font-black text-slate-800 uppercase">New Payment</h2>
          </div>

          <form onSubmit={handleSavePayment} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Student</label>
              <select required value={formData.studentId} onChange={handleStudentSelect} className="w-full bg-white/60 backdrop-blur-sm outline-none rounded-xl px-4 py-3 text-sm font-bold border border-white/25 focus:border-warning uppercase">
                <option value="" disabled>-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.fullName} (Roll: {s.rollNumber}) - {s.classGrade}</option>
                ))}
              </select>
            </div>

            {formData.studentId && (
              <div className="bg-white/40 p-4 rounded-xl border border-white/20 text-sm font-bold uppercase text-slate-600">
                <p>Class: <span className="text-slate-800">{formData.classGrade}</span></p>
                <p>Roll No: <span className="text-slate-800">{formData.rollNumber}</span></p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fee Month</label>
              <input required type="text" value={formData.feeMonth} onChange={e => setFormData({ ...formData, feeMonth: e.target.value })} placeholder="e.g. April 2026" className="w-full bg-white/60 backdrop-blur-sm outline-none rounded-xl px-4 py-3 text-sm font-bold border border-white/25 focus:border-warning uppercase" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Paid (Rs)</label>
              <input required type="number" min="0" value={formData.amountPaid} onChange={e => setFormData({ ...formData, amountPaid: e.target.value })} placeholder="0.00" className="w-full bg-white/60 backdrop-blur-sm outline-none rounded-xl px-4 py-3 text-lg font-black border border-white/25 focus:border-warning text-slate-800" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Method</label>
              <select required value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full bg-white/60 backdrop-blur-sm outline-none rounded-xl px-4 py-3 text-sm font-bold border border-white/25 focus:border-warning uppercase">
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Online / JazzCash</option>
              </select>
            </div>

            <button disabled={loading} type="submit" className="w-full btn-primary py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 mt-4 uppercase tracking-widest">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><Receipt size={18} /> Process Payment</>}
            </button>
          </form>
        </div>

        {/* Ledger */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[800px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-white/20 pb-4">
            <h2 className="text-lg font-black text-slate-800 uppercase">Transaction Ledger</h2>
            <div className="bg-white/40 rounded-xl px-4 py-2 flex items-center gap-3 border border-white/25 w-full sm:w-auto">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search roll no or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none text-sm font-bold uppercase w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold text-sm uppercase">
                <Receipt size={48} className="opacity-20 mb-4" />
                No transactions recorded yet.
              </div>
            ) : (
              filteredTransactions.map((t, idx) => (
                <div key={t.id || idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/40 border border-white/20 p-4 rounded-2xl hover:border-warning/40 transition-colors gap-4">
                  <div className="flex-1">
                    <p className="font-black text-slate-800 uppercase text-sm">{t.studentName || "Unknown"} <span className="text-xs text-slate-500 ml-2">Roll: {t.rollNumber || "-"}</span></p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t.classGrade || ""} • {t.feeMonth || ""}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{formatTransactionDate(t)}</p>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="bg-white/60 text-slate-700 px-3 py-1 rounded-lg text-xs font-black uppercase border border-white/20">
                      {t.paymentMethod || "Cash"}
                    </span>
                    <span className="text-lg font-black text-success">
                      Rs {(Number(t.amountPaid) || 0).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleOnlinePayment(t)}
                      disabled={onlinePaymentLoading === t.id}
                      className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      {onlinePaymentLoading === t.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                      {onlinePaymentLoading === t.id ? "..." : "Pay Online"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
