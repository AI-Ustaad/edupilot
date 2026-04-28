"use client";
import React, { useState, useEffect } from "react";
import { Wallet, CheckCircle2, AlertCircle, Search, Loader2, Receipt, CreditCard } from "lucide-react";

export default function FeesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      // 1. ڈراپ ڈاؤن کے لیے سٹوڈنٹس منگوائیں
      const stuRes = await fetch("/api/students", { credentials: "include" });
      if (stuRes.ok) setStudents(await stuRes.json());

      // 2. پچھلی فیس کی ہسٹری منگوائیں
      const feeRes = await fetch("/api/fees", { credentials: "include" });
      if (feeRes.ok) setTransactions(await feeRes.json());
    } catch (error) {
      console.error("Data Fetch Error:", error);
    }
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const student = students.find(s => s.id === e.target.value);
    if (student) {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        classGrade: `${student.classGrade} ${student.section ? `- ${student.section}` : ""}`
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
      setFormData({ ...formData, amountPaid: "", remarks: "" }); // Reset amount but keep month
      fetchData(); // Refresh history
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg("Error processing payment. Ensure you have network connectivity.");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  const filteredTransactions = transactions.filter(t => 
    t.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.rollNumber?.toString().includes(searchTerm)
  );

  return (
    <div className="animate-fade-in space-y-6 pb-20 w-full max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
            <Wallet className="text-amber-500" size={28}/> Fee Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Process payments & generate receipts</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-black uppercase text-sm border border-amber-100">
           Total Collected: Rs {transactions.reduce((sum, t) => sum + Number(t.amountPaid || 0), 0).toLocaleString()}
        </div>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold uppercase animate-fade-in-down w-full shadow-sm">
          <CheckCircle2 size={20}/> Payment processed successfully!
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-bold uppercase animate-fade-in-down w-full shadow-sm">
          <AlertCircle size={20}/> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 👉 FORM: Collect Fee */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-fit">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
             <CreditCard className="text-slate-400" size={20}/>
             <h2 className="text-lg font-black text-[#0F172A] uppercase">New Payment</h2>
          </div>
          
          <form onSubmit={handleSavePayment} className="space-y-5">
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Student</label>
               <select required value={formData.studentId} onChange={handleStudentSelect} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-amber-500 uppercase">
                  <option value="" disabled>-- Choose Student --</option>
                  {students.map(s => (
                     <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNumber}) - {s.classGrade}</option>
                  ))}
               </select>
            </div>

            {formData.studentId && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-bold uppercase text-slate-600">
                 <p>Class: <span className="text-slate-900">{formData.classGrade}</span></p>
                 <p>Roll No: <span className="text-slate-900">{formData.rollNumber}</span></p>
              </div>
            )}

            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Month</label>
               <input required type="text" value={formData.feeMonth} onChange={e => setFormData({...formData, feeMonth: e.target.value})} placeholder="e.g. April 2026" className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-amber-500 uppercase" />
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid (Rs)</label>
               <input required type="number" min="0" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} placeholder="0.00" className="w-full bg-amber-50 outline-none rounded-xl px-4 py-3 text-lg font-black border border-amber-200 text-amber-900 focus:border-amber-500" />
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
               <select required value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 focus:border-amber-500 uppercase">
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Online / JazzCash</option>
               </select>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-amber-500 transition-all shadow-lg disabled:opacity-50 uppercase tracking-widest mt-4">
               {loading ? <><Loader2 size={18} className="animate-spin"/> Processing...</> : <><Receipt size={18}/> Process Payment</>}
            </button>
          </form>
        </div>

        {/* 👉 LEDGER: Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[800px]">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-[#0F172A] uppercase">Transaction Ledger</h2>
              <div className="bg-slate-50 rounded-xl px-4 py-2 flex items-center gap-3 border border-slate-200 w-full sm:w-auto">
                 <Search size={16} className="text-slate-400" />
                 <input type="text" placeholder="Search roll no or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none text-sm font-bold uppercase w-full" />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
             {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold text-sm uppercase">
                   <Receipt size={48} className="opacity-20 mb-4"/>
                   No transactions recorded yet.
                </div>
             ) : (
                filteredTransactions.map((t, idx) => (
                   <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:border-amber-200 transition-colors gap-4">
                      <div>
                         <p className="font-black text-[#0F172A] uppercase text-sm">{t.studentName} <span className="text-xs text-slate-400 ml-2">Roll: {t.rollNumber}</span></p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t.classGrade} • {t.feeMonth}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{new Date(t.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                         <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-xs font-black uppercase border border-amber-200">
                            {t.paymentMethod}
                         </span>
                         <span className="text-lg font-black text-green-600">
                            Rs {Number(t.amountPaid).toLocaleString()}
                         </span>
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
