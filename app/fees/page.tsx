"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Wallet, Search, Save, CheckCircle2, AlertCircle, 
  Users, Trash2, Edit3, Loader2, Calendar, FileText
} from "lucide-react";

export default function FeeCollectionPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  
  // Search & Select
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feeMonth, setFeeMonth] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [status, setStatus] = useState("Paid");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Fetch Students for the Dropdown/Search
    const unsubStudents = onSnapshot(query(collection(db, "students")), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    // Fetch Live Fee Ledger
    const unsubFees = onSnapshot(query(collection(db, "fees")), (snap) => {
      setFeeRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubStudents(); unsubFees(); };
  }, []);

  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (s.name?.toLowerCase().includes(q) || s.rollNumber?.toString().includes(q) || s.classGrade?.toLowerCase().includes(q));
  }).slice(0, 5); // Show top 5 matches in dropdown

  const resetForm = () => {
    setEditingId(null);
    setSelectedStudent(null);
    setFeeMonth("");
    setAmountPaid("");
    setPaymentMethod("Cash");
    setStatus("Paid");
    setRemarks("");
  };

  const handleSaveFee = async () => {
    if (!selectedStudent || !feeMonth || !amountPaid) return alert("Please select a student, month, and enter the amount.");
    
    setLoading(true);
    try {
      // If creating new, generate a unique ID based on student and timestamp
      const docId = editingId || `${selectedStudent.id}_${Date.now()}`;
      
      await setDoc(doc(db, "fees", docId), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        classGrade: selectedStudent.classGrade,
        rollNumber: selectedStudent.rollNumber,
        feeMonth,
        amountPaid: Number(amountPaid),
        paymentMethod,
        status,
        remarks,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSuccess(true);
      resetForm();
      setSearchQuery("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save fee record.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFee = (record: any) => {
    setEditingId(record.id);
    setSelectedStudent({
       id: record.studentId, name: record.studentName, classGrade: record.classGrade, rollNumber: record.rollNumber 
    });
    setFeeMonth(record.feeMonth || "");
    setAmountPaid(record.amountPaid?.toString() || "");
    setPaymentMethod(record.paymentMethod || "Cash");
    setStatus(record.status || "Paid");
    setRemarks(record.remarks || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFee = async (id: string) => {
    if(confirm("Are you sure you want to delete this fee record? It will be removed from financial analytics.")) {
      try { 
         await deleteDoc(doc(db, "fees", id)); 
         if(editingId === id) resetForm(); 
      } catch (err) { alert("Failed to delete."); }
    }
  };

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Wallet className="text-[#3ac47d]"/> Fee Collection Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">Record, edit, and track student payments securely.</p>
        </div>
        {editingId && (
           <button onClick={resetForm} className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold shadow-sm hover:bg-slate-50">
             Cancel Edit
           </button>
        )}
      </div>

      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Fee Record Saved Successfully!</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* --- LEFT: FEE ENTRY FORM --- */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
               <h2 className="font-black text-[#0F172A] text-lg mb-6 flex items-center gap-2">
                 <FileText size={18} className="text-[#3ac47d]"/> 
                 {editingId ? "Update Receipt" : "Generate Receipt"}
               </h2>

               {/* Student Search (Disabled during edit to prevent mixing records) */}
               <div className="space-y-2 mb-6 relative">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Student</label>
                 {selectedStudent ? (
                    <div className="flex justify-between items-center bg-[#f0fdf4] border border-green-200 p-3 rounded-xl">
                       <div>
                         <p className="font-black text-green-800 text-sm">{selectedStudent.name}</p>
                         <p className="text-[10px] font-bold text-green-600 uppercase">Roll: {selectedStudent.rollNumber} • {selectedStudent.classGrade}</p>
                       </div>
                       {!editingId && <button onClick={() => setSelectedStudent(null)} className="text-green-500 hover:text-green-700"><Trash2 size={16}/></button>}
                    </div>
                 ) : (
                    <div>
                      <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input type="text" placeholder="Search by name or roll no..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d] transition-colors" />
                      </div>
                      {searchQuery && (
                         <div className="absolute z-10 w-full bg-white mt-2 border border-slate-100 shadow-xl rounded-xl overflow-hidden">
                            {filteredStudents.length === 0 ? <p className="p-3 text-xs text-slate-400 font-bold text-center">No student found.</p> : filteredStudents.map(s => (
                               <div key={s.id} onClick={() => { setSelectedStudent(s); setSearchQuery(""); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center">
                                  <p className="font-bold text-sm text-slate-700">{s.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{s.classGrade}</p>
                               </div>
                            ))}
                         </div>
                      )}
                    </div>
                 )}
               </div>

               {/* Fee Details */}
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee Month</label>
                    <input type="month" value={feeMonth} onChange={(e) => setFeeMonth(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid (Rs)</label>
                       <input type="number" placeholder="e.g. 5000" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-[#3ac47d] text-[#0F172A]" />
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                       <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]">
                          <option value="Paid">Paid in Full</option>
                          <option value="Partial">Partial Payment</option>
                       </select>
                     </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#3ac47d]">
                       <option value="Cash">Cash</option><option value="Bank Transfer">Bank Transfer</option><option value="EasyPaisa/JazzCash">EasyPaisa / JazzCash</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remarks (Optional)</label>
                    <input type="text" placeholder="Transaction ID or notes..." value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#3ac47d]" />
                  </div>

                  <button onClick={handleSaveFee} disabled={loading || !selectedStudent || !amountPaid || !feeMonth} className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-black text-lg hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50">
                     {loading ? <Loader2 size={24} className="animate-spin"/> : <Save size={24}/>} 
                     {editingId ? "Update Fee Record" : "Save Payment"}
                  </button>
               </div>
            </div>
         </div>

         {/* --- RIGHT: FEE LEDGER (HISTORY) --- */}
         <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="px-6 py-5 bg-[#0F172A] text-white flex justify-between items-center">
                  <h2 className="font-black flex items-center gap-2"><Calendar size={18}/> Live Transactions Ledger</h2>
                  <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold">{feeRecords.length} Entries</div>
               </div>
               
               <div className="p-6">
                 {feeRecords.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                       <Wallet size={48} className="mx-auto mb-4 opacity-30"/>
                       <h3 className="font-black text-lg">No Transactions Yet</h3>
                       <p className="text-sm font-medium">Collect fees using the form to populate the ledger.</p>
                    </div>
                 ) : (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="border-b-2 border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="pb-3 px-2">Student Details</th>
                                <th className="pb-3 px-2">Fee Month</th>
                                <th className="pb-3 px-2">Amount Paid</th>
                                <th className="pb-3 px-2">Status & Method</th>
                                <th className="pb-3 px-2 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {feeRecords.sort((a,b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis()).map(record => (
                                <tr key={record.id} className={`hover:bg-slate-50 transition-colors ${editingId === record.id ? 'bg-blue-50/50' : ''}`}>
                                   <td className="py-4 px-2">
                                      <p className="font-black text-slate-800 text-sm">{record.studentName}</p>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase">{record.classGrade} • Roll: {record.rollNumber}</p>
                                   </td>
                                   <td className="py-4 px-2 font-bold text-slate-600">{record.feeMonth}</td>
                                   <td className="py-4 px-2 font-black text-[#0F172A] text-lg">Rs {record.amountPaid?.toLocaleString()}</td>
                                   <td className="py-4 px-2">
                                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-1 ${record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                         {record.status}
                                      </span>
                                      <p className="text-[10px] font-bold text-slate-400">{record.paymentMethod}</p>
                                   </td>
                                   
                                   {/* 🚀 EDIT AND DELETE BUTTONS IN LEDGER */}
                                   <td className="py-4 px-2 text-right">
                                      <div className="flex justify-end gap-2">
                                         <button onClick={() => handleEditFee(record)} className="bg-orange-50 text-orange-600 p-2 rounded-lg hover:bg-orange-100 transition-colors" title="Edit Record">
                                            <Edit3 size={16}/>
                                         </button>
                                         <button onClick={() => handleDeleteFee(record.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors" title="Delete Record">
                                            <Trash2 size={16}/>
                                         </button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
