"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Printer, User, CheckCircle2, XCircle, Clock, CalendarDays, X, ShieldCheck, Phone, BookOpen, CreditCard, Activity, Receipt, Award } from "lucide-react";

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leave: 0, total: 0, percentage: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const [totalFeesPaid, setTotalFeesPaid] = useState(0);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [showFeeModal, setShowFeeModal] = useState(false);

  // --- NEW: Exam & Result States ---
  const [examRecords, setExamRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!studentId) { router.push("/students"); return; }

    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "students", studentId));
        if (docSnap.exists()) setStudent({ id: docSnap.id, ...docSnap.data() });
        else return router.push("/students");

        // Fetch Attendance
        const attQ = query(collection(db, "attendance"), where("studentId", "==", studentId));
        const attSnap = await getDocs(attQ);
        let p = 0, a = 0, l = 0; const aRecs: any[] = [];
        attSnap.forEach((doc) => { const data = doc.data(); aRecs.push(data); if (data.status === "Present") p++; if (data.status === "Absent") a++; if (data.status === "Leave") l++; });
        const total = p + a + l; setAttendanceStats({ present: p, absent: a, leave: l, total, percentage: total > 0 ? Math.round((p / total) * 100) : 0 });
        setAttendanceRecords(aRecs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        // Fetch Fees
        const feeQ = query(collection(db, "fees"), where("studentId", "==", studentId));
        const feeSnap = await getDocs(feeQ);
        let tFee = 0; const fRecs: any[] = [];
        feeSnap.forEach((doc) => { const data = doc.data(); fRecs.push(data); tFee += Number(data.amount || 0); });
        setTotalFeesPaid(tFee); setFeeRecords(fRecs.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));

        // --- NEW: Fetch Exam Marks/Results ---
        const examQ = query(collection(db, "marks"), where("studentId", "==", studentId));
        const examSnap = await getDocs(examQ);
        const eRecs: any[] = [];
        examSnap.forEach((doc) => { eRecs.push({ id: doc.id, ...doc.data() }); });
        // Sort by newest first
        setExamRecords(eRecs.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));

      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchData();
  }, [studentId, router]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#3ac47d]"></div></div>;
  if (!student) return null;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20 relative">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border font-bold text-sm"><ArrowLeft size={16} /> Back</button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#3ac47d] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md"><Printer size={16} /> Print Profile</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 relative">
        <div className="h-32 bg-[#3ac47d] relative overflow-hidden flex items-center justify-end px-10"><ShieldCheck size={100} className="text-white/20 absolute -right-4 -bottom-4" /></div>
        <div className="px-8 pb-8 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
          <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-lg shrink-0 border">{student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full rounded-xl object-cover" /> : <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center"><User size={40} className="text-slate-300"/></div>}</div>
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-extrabold text-[#0F172A]">{student.name}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Class {student.classGrade} {student.section && `- ${student.section}`} | Roll No: {student.rollNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><User size={16} /> Personal Identity</h3><div className="space-y-4"><div><p className="text-xs text-gray-400">Date of Birth</p><p className="font-bold text-sm">{student.dob || "N/A"}</p></div><div><p className="text-xs text-gray-400">Gender</p><p className="font-bold text-sm">{student.gender || "N/A"}</p></div><div><p className="text-xs text-gray-400">Religion</p><p className="font-bold text-sm">{student.religion || "Islam"}</p></div></div></div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"><div className="absolute top-4 right-4 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1"><ShieldCheck size={12} /> AUTHORIZED</div><h3 className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-5 flex items-center gap-2"><Phone size={16} /> Contact Details</h3><div className="space-y-4"><div><p className="text-xs text-gray-400">Father's Name</p><p className="font-bold text-sm">{student.fatherName}</p></div><div><p className="text-xs text-gray-400">CNIC / B-Form</p><p className="font-bold text-sm">{student.idNumber}</p></div><div><p className="text-xs text-gray-400">Phone</p><p className="font-bold text-sm text-blue-600">{student.phone}</p></div></div></div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div onClick={() => setShowAttendanceModal(true)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-[#3ac47d] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><CalendarDays size={24} /></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Attendance</p><p className="text-2xl font-black text-[#0F172A]">{attendanceStats.percentage}%</p><p className="text-[10px] text-blue-500 font-medium">Click for details</p></div>
            </div>

            <div onClick={() => setShowFeeModal(true)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-[#3ac47d] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform"><CreditCard size={24} /></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Fees Paid</p><p className="text-xl font-black text-[#0F172A]">Rs {totalFeesPaid.toLocaleString()}</p><p className="text-[10px] text-green-500 font-medium">Click for ledger</p></div>
            </div>

            {/* --- UPDATED EXAMS COUNTER --- */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-[#3ac47d] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><BookOpen size={24} /></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Exams Taken</p><p className="text-2xl font-black text-[#0F172A]">{examRecords.length}</p><p className="text-[10px] text-orange-500 font-medium">Scroll down to view</p></div>
            </div>
          </div>

          {/* --- NEW: ACADEMIC PERFORMANCE (LIVE DATA) --- */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[300px]">
            <h3 className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-6 flex items-center gap-2"><Award size={16} /> Academic Performance History</h3>
            
            <div className="space-y-4">
              {examRecords.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-10">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p className="font-medium text-sm">No exam records found for this student.</p>
                </div>
              ) : (
                examRecords.map((exam, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-100 p-5 rounded-2xl hover:shadow-md transition-all group">
                    <div className="w-full sm:w-auto mb-4 sm:mb-0">
                      <p className="text-sm font-black text-[#0F172A] uppercase tracking-widest bg-white inline-block px-3 py-1 rounded-lg border border-slate-200 mb-2">{exam.term}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">Level: {exam.level} • Class: {exam.classGrade}</p>
                    </div>
                    <div className="flex gap-6 items-center w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Obtained</p>
                        <p className="font-black text-lg text-slate-700">{exam.totalObtained} <span className="text-sm text-slate-400">/ {exam.totalMax}</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Percentage</p>
                        <p className="font-black text-lg text-blue-500">{exam.percentage}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Grade</p>
                        <p className={`font-black text-2xl ${exam.grade === 'U' ? 'text-red-500' : 'text-[#3ac47d]'}`}>{exam.grade}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Keep Attendance and Fee Modals Below Here (No Changes) --- */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-down"><div className="bg-[#0F172A] p-6 flex justify-between items-center text-white"><div><h2 className="text-lg font-bold">Attendance Breakdown</h2><p className="text-xs text-slate-400">{student.name} - Class {student.classGrade}</p></div><button onClick={() => setShowAttendanceModal(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={18} /></button></div><div className="p-6"><div className="grid grid-cols-3 gap-4 mb-6"><div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100"><CheckCircle2 size={24} className="text-green-500 mx-auto mb-2" /><p className="text-2xl font-black text-green-700">{attendanceStats.present}</p><p className="text-[10px] font-bold text-green-600 uppercase">Present</p></div><div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100"><XCircle size={24} className="text-red-500 mx-auto mb-2" /><p className="text-2xl font-black text-red-700">{attendanceStats.absent}</p><p className="text-[10px] font-bold text-red-600 uppercase">Absent</p></div><div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100"><Clock size={24} className="text-blue-500 mx-auto mb-2" /><p className="text-2xl font-black text-blue-700">{attendanceStats.leave}</p><p className="text-[10px] font-bold text-blue-600 uppercase">Leave</p></div></div><div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center mb-6"><span className="font-bold text-slate-500 text-sm">Total Working Days</span><span className="font-black text-lg text-[#0F172A]">{attendanceStats.total}</span></div><h3 className="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Record History</h3><div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">{attendanceRecords.length === 0 ? <p className="text-sm text-center text-slate-400 py-4">No attendance marked.</p> : attendanceRecords.map((r, i) => <div key={i} className="flex justify-between p-3 bg-white border border-slate-100 rounded-xl"><span className="text-sm font-medium">{new Date(r.date).toLocaleDateString('en-GB')}</span><span className={`text-xs font-bold px-3 py-1 rounded-full ${r.status === 'Present' ? 'bg-green-100 text-green-700' : r.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span></div>)}</div></div></div></div>
      )}

      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-down"><div className="bg-[#3ac47d] p-6 flex justify-between items-center text-white"><div><h2 className="text-lg font-bold">Fee Transaction Ledger</h2><p className="text-xs text-white/80">{student.name} - Roll No: {student.rollNumber}</p></div><button onClick={() => setShowFeeModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"><X size={18} /></button></div><div className="p-6"><div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex justify-between items-center mb-6"><span className="font-bold text-green-700 text-sm uppercase tracking-widest">Total Cleared</span><span className="font-black text-2xl text-[#3ac47d]">Rs {totalFeesPaid.toLocaleString()}</span></div><h3 className="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Transaction History</h3><div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2 pr-2">{feeRecords.length === 0 ? <div className="flex flex-col items-center py-8 text-slate-400"><Receipt size={32} className="mb-2 opacity-50"/><p className="text-sm">No fee records found.</p></div> : feeRecords.map((r, i) => <div key={i} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm"><div><p className="text-sm font-bold text-slate-800">{r.category}</p><p className="text-[10px] font-medium text-slate-500">{new Date(r.createdAt?.toDate()).toLocaleDateString('en-GB')} • {r.month}</p></div><span className="font-black text-[#3ac47d]">Rs {r.amount}</span></div>)}</div></div></div></div>
      )}

    </div>
  );
}

export default function StudentProfilePage() {
  return <Suspense fallback={<div className="h-screen flex items-center justify-center text-[#3ac47d]">Loading...</div>}><StudentProfileContent /></Suspense>;
}
