"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Printer, User, CheckCircle2, XCircle, Clock, CalendarDays, X, ShieldCheck, Phone, BookOpen, CreditCard, Activity } from "lucide-react";

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  
  // Attendance States
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leave: 0, total: 0, percentage: 0 });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  useEffect(() => {
    if (!studentId) {
      router.push("/students");
      return;
    }

    const fetchStudentData = async () => {
      try {
        // 1. Fetch Student Details
        const docRef = doc(db, "students", studentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStudent({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Student not found!");
          router.push("/students");
          return;
        }

        // 2. Fetch Attendance Records for this student
        const q = query(collection(db, "attendance"), where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);
        
        let p = 0, a = 0, l = 0;
        const records: any[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          records.push(data);
          if (data.status === "Present") p++;
          if (data.status === "Absent") a++;
          if (data.status === "Leave") l++;
        });

        const total = p + a + l;
        const percentage = total > 0 ? Math.round((p / total) * 100) : 0;
        
        // Sort records by date (newest first)
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setAttendanceStats({ present: p, absent: a, leave: l, total, percentage });
        setAttendanceRecords(records);

      } catch (error) {
        console.error("Error fetching student profile: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3ac47d]"></div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20 relative">
      
      {/* Top Actions */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#3ac47d] transition-colors font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#3ac47d] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#2eaa6a] transition-all">
          <Printer size={16} /> Print Profile
        </button>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 relative">
        <div className="h-32 bg-[#3ac47d] relative overflow-hidden flex items-center justify-end px-10">
           <ShieldCheck size={100} className="text-white/20 absolute -right-4 -bottom-4" />
        </div>
        
        <div className="px-8 pb-8 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
          <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-lg shrink-0 border border-slate-100">
            {student.photoBase64 ? (
              <img src={student.photoBase64} alt="Student" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center"><User size={40} /></div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-extrabold text-[#0F172A]">{student.name}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Class {student.classGrade} {student.section && `- ${student.section}`} | Roll No: {student.rollNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Details */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><User size={16} /> Personal Identity</h3>
            <div className="space-y-4">
              <div><p className="text-xs text-gray-400">Date of Birth</p><p className="font-bold text-sm text-[#0F172A]">{student.dob || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Gender</p><p className="font-bold text-sm text-[#0F172A]">{student.gender || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Religion</p><p className="font-bold text-sm text-[#0F172A]">{student.religion || "Islam"}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <ShieldCheck size={12} /> AUTHORIZED ONLY
            </div>
            <h3 className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-5 flex items-center gap-2"><Phone size={16} /> Contact Details</h3>
            <div className="space-y-4">
              <div><p className="text-xs text-gray-400">Father's Name</p><p className="font-bold text-sm text-[#0F172A]">{student.fatherName || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">CNIC / B-Form</p><p className="font-bold text-sm text-[#0F172A]">{student.idNumber || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Phone Number</p><p className="font-bold text-sm text-blue-600">{student.phone || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Address</p><p className="font-bold text-sm text-[#0F172A]">{student.address || "N/A"}</p></div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Performance */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Actionable Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Clickable Attendance Card */}
            <div 
              onClick={() => setShowAttendanceModal(true)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-[#3ac47d] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><CalendarDays size={24} /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Attendance</p>
                <p className="text-2xl font-black text-[#0F172A]">{attendanceStats.percentage}%</p>
                <p className="text-[10px] text-blue-500 font-medium mt-0.5">Click for details</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center"><CreditCard size={24} /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Fees Paid</p>
                <p className="text-2xl font-black text-[#0F172A]">Rs 0</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><BookOpen size={24} /></div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Exams Taken</p>
                <p className="text-2xl font-black text-[#0F172A]">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[300px]">
            <h3 className="text-xs font-bold text-[#3ac47d] uppercase tracking-widest mb-5 flex items-center gap-2"><Activity size={16} /> Academic Performance</h3>
            <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-10">
              <Activity size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-sm">No exam records found for this student.</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- THE ATTENDANCE MODAL --- */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-down">
            
            <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-lg font-bold">Attendance Breakdown</h2>
                <p className="text-xs text-slate-400">{student.name} - Class {student.classGrade}</p>
              </div>
              <button onClick={() => setShowAttendanceModal(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                  <CheckCircle2 size={24} className="text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-green-700">{attendanceStats.present}</p>
                  <p className="text-[10px] font-bold text-green-600 uppercase">Present</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                  <XCircle size={24} className="text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-red-700">{attendanceStats.absent}</p>
                  <p className="text-[10px] font-bold text-red-600 uppercase">Absent</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                  <Clock size={24} className="text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-blue-700">{attendanceStats.leave}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Leave</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center mb-6">
                 <span className="font-bold text-slate-500 text-sm">Total Working Days</span>
                 <span className="font-black text-lg text-[#0F172A]">{attendanceStats.total}</span>
              </div>

              <h3 className="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Recent Record History</h3>
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {attendanceRecords.length === 0 ? (
                  <p className="text-sm text-center text-slate-400 py-4">No attendance marked yet.</p>
                ) : (
                  attendanceRecords.map((record, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-sm font-medium text-slate-600">{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        record.status === 'Present' ? 'bg-green-100 text-green-700' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-[#3ac47d] font-bold">Loading Profile...</div>}>
      <StudentProfileContent />
    </Suspense>
  );
}
