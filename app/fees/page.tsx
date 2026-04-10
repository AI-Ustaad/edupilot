"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Receipt, CheckCircle2, AlertCircle, Printer, Search, CreditCard, User, History, Trash2 } from "lucide-react";

export default function FeesPage() {
  // Vercel SSR Bypass
  const [isMounted, setIsMounted] = useState(false);

  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form States
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  
  const [feeData, setFeeData] = useState({
    category: "Monthly Fee",
    amount: "",
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    paymentMethod: "Cash",
    status: "Paid"
  });

  // 1. Fetch Students and Fee Records on Mount
  useEffect(() => {
    setIsMounted(true);

    // Fetch Students
    const studentQ = query(collection(db, "students"), orderBy("rollNumber", "asc"));
    const unsubStudents = onSnapshot(studentQ, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Recent Fees
    const feeQ = query(collection(db, "fees"), orderBy("createdAt", "desc"));
    const unsubFees = onSnapshot(feeQ, (snapshot) => {
      setFeeRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStudents(); unsubFees(); };
  }, []);

  // 2. Dynamic Filters Logic
  const availableClasses = Array.from(new Set(students.map(s => s.classGrade))).filter(Boolean);
  const availableSections = Array.from(new Set(students.filter(s => s.classGrade === selectedClass).map(s => s.section))).filter(Boolean);
  const filteredStudents = students.filter(s => s.classGrade === selectedClass && (selectedSection ? s.section === selectedSection : true));

  const activeStudent = students.find(s => s.id === selectedStudentId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFeeData({ ...feeData, [e.target.name]: e.target.value });
  };

  // 3. Save Fee Record to Central Database
  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !feeData.amount) return setErrorMsg("Please select a student and enter amount.");
    
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      await addDoc(collection(db, "fees"), {
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        rollNumber: activeStudent.rollNumber || "N/A",
        classGrade: activeStudent.classGrade,
        section: activeStudent.section || "",
        ...feeData,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setFeeData({ ...feeData, amount: "" }); // Reset amount after saving
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrorMsg("Failed to save fee record.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm("Delete this transaction?")) await deleteDoc(doc(db, "fees", id));
  };

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Finance Portal</h1>
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-bold">Fee & Accounts Management</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 text-slate-600 font-bold text-sm">
          <History size={18} /> {feeRecords.length} Transactions
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Generate Fee Form (print:hidden) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 print:hidden">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard size={20} className="text-[#3ac47d]"/> Generate Fee Receipt</h2>
          
          {success && <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex gap-3"><CheckCircle2/> Receipt saved & added to ledger!</div>}
          {errorMsg && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex gap-3"><AlertCircle/> {errorMsg}</div>}

          <form onSubmit={handleSaveFee} className="space-y-6">
            
            {/* Step 1: Find Student */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">1. Locate Student</h3>
              <div className="grid grid-cols-2 gap-4">
                <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); setSelectedStudentId(""); }} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200">
                  <option value="" disabled>Select Class</option>
                  {availableClasses.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                </select>
                <select value={selectedSection} onChange={(e) => { setSelectedSection(e.target.value); setSelectedStudentId(""); }} disabled={!selectedClass} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 disabled:opacity-50">
                  <option value="">All Sections</option>
                  {availableSections.map(s => <option key={s as string} value={s as string}>Section {s as string}</option>)}
                </select>
              </div>
              <select required value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={!selectedClass} className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 disabled:opacity-50 font-bold text-[#0F172A]">
                <option value="" disabled>-- Select Student --</option>
                {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNumber})</option>)}
              </select>
            </div>

            {/* Step 2: Fee Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">2. Fee Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <select name="category" value={feeData.category} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100">
                  <option>Monthly Fee</option><option>Admission Fee</option><option>Annual Charges</option><option>Fine/Other</option>
                </select>
                <input required name="amount" type="number" value={feeData.amount} onChange={handleInputChange} placeholder="Amount (Rs.)" className="w-full bg-[#f0fdf4] outline-none rounded-xl px-4 py-3 text-sm border border-green-100 text-green-700 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="month" name="month" value={feeData.month} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100 text-slate-600" />
                <select name="paymentMethod" value={feeData.paymentMethod} onChange={handleInputChange} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border border-slate-100">
                  <option>Cash</option><option>Bank Transfer</option><option>Cheque</option>
                </select>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all">
              {loading ? "Processing..." : "Save Fee Receipt"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Receipt Preview (Visible in Print) */}
        <div className="relative">
          <div className="sticky top-6">
            {!activeStudent ? (
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 print:hidden">
                 <Receipt size={48} className="mb-4 opacity-50" />
                 <p className="font-medium text-sm">Select a student to generate receipt preview.</p>
               </div>
            ) : (
               <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 print:shadow-none print:border-2 print:border-black print:rounded-none">
                 
                 {/* Print Button */}
                 <div className="flex justify-end mb-4 print:hidden">
                   <button onClick={() => window.print()} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                     <Printer size={16} /> Print Voucher
                   </button>
                 </div>

                 {/* Receipt Content */}
                 <div className="border-b-2 border-dashed border-slate-200 pb-6 mb-6 text-center">
                   <h1 className="text-2xl font-black text-[#0F172A] uppercase tracking-widest">School Name Here</h1>
                   <p className="text-sm text-slate-500 font-medium mt-1">Official Fee Receipt</p>
                 </div>

                 <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center"><span className="text-slate-400 text-xs font-bold uppercase">Date</span><span className="font-bold text-sm text-slate-800">{new Date().toLocaleDateString('en-GB')}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400 text-xs font-bold uppercase">Student Name</span><span className="font-black text-lg text-[#0F172A] uppercase">{activeStudent.name}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-400 text-xs font-bold uppercase">Class / Roll No</span><span className="font-bold text-sm text-slate-800">{activeStudent.classGrade} {activeStudent.section && `- ${activeStudent.section}`} (Roll: {activeStudent.rollNumber})</span></div>
                 </div>

                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mb-6 print:bg-transparent print:border-y-2 print:border-black print:rounded-none">
                   <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">{feeData.category} ({feeData.month})</span><span className="font-bold text-slate-800">Rs {feeData.amount || "0"}</span></div>
                   <div className="flex justify-between items-center"><span className="text-slate-600 font-medium">Payment Method</span><span className="font-bold text-slate-800">{feeData.paymentMethod}</span></div>
                 </div>

                 <div className="flex justify-between items-center bg-[#f0fdf4] p-4 rounded-xl border border-green-200 print:bg-transparent print:border-none print:p-0">
                   <span className="text-green-800 font-black uppercase tracking-widest text-sm">Total Paid</span>
                   <span className="text-3xl font-black text-[#3ac47d]">Rs {feeData.amount || "0"}</span>
                 </div>
                 
                 <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-end print:block">
                   <p className="text-[10px] text-slate-400">System generated receipt.</p>
                   <div className="text-center print:mt-10"><div className="w-32 border-b border-black mb-1"></div><p className="text-[10px] font-bold">Authorized Signature</p></div>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS LEDGER (print:hidden) */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8 print:hidden">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Transactions Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
              <tr><th className="p-4 rounded-tl-xl">Date</th><th className="p-4">Student</th><th className="p-4">Class</th><th className="p-4">Category</th><th className="p-4">Amount</th><th className="p-4 rounded-tr-xl text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeRecords.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No recent transactions found.</td></tr>
              ) : (
                feeRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-600">{new Date(record.createdAt?.toDate()).toLocaleDateString('en-GB')}</td>
                    <td className="p-4 font-bold text-[#0F172A]">{record.studentName}</td>
                    <td className="p-4 text-slate-600">{record.classGrade} {record.section}</td>
                    <td className="p-4 text-slate-600">{record.category}</td>
                    <td className="p-4 font-black text-[#3ac47d]">Rs {record.amount}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteRecord(record.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-md"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .relative .sticky > div { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; }
          .relative .sticky > div * { visibility: visible; }
        }
      `}</style>
    </div>
  );
}
