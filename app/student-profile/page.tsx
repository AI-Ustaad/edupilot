"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext"; // <-- رول چیک کرنے کے لیے امپورٹ کیا
import { 
  ArrowLeft, User, Phone, Calendar, CreditCard, CheckSquare, 
  Award, ShieldCheck, Printer, MapPin, Activity, BookOpen, Lock
} from "lucide-react";

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get("id");
  
  // یہاں سے پتا چلے گا کہ دیکھنے والا کون ہے (Admin, Teacher, یا Student)
  const { user, role } = useAuth(); 

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [feeTotal, setFeeTotal] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leave: 0 });

  useEffect(() => {
    if (!studentId) {
      router.push("/students");
      return;
    }

    const fetchStudentData = async () => {
      try {
        const docRef = doc(db, "students", studentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          // --- SECURITY CHECK 1: سٹوڈنٹ صرف اپنا پروفائل دیکھ سکتا ہے ---
          // فرض کریں سٹوڈنٹ کی ای میل یا آئی ڈی میچ کرنی چاہیے (ابھی کے لیے ہم اسے رول پر محدود کر رہے ہیں)
          if (role === "student" && user?.uid !== docSnap.id && user?.email !== docSnap.data().email) {
             alert("Access Denied: You can only view your own profile.");
             router.push("/dashboard");
             return;
          }
          setStudent({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Student not found!");
          router.push("/students");
          return;
        }

        // Marks, Fees, Attendance Fetching (Same as before)
        const marksQuery = query(collection(db, "marks"), where("studentId", "==", studentId));
        const marksSnap = await getDocs(marksQuery);
        setMarks(marksSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const feesQuery = query(collection(db, "fees"), where("studentId", "==", studentId));
        const feesSnap = await getDocs(feesQuery);
        let totalF = 0;
        feesSnap.forEach(f => { totalF += Number(f.data().amount || 0); });
        setFeeTotal(totalF);

        const attQuery = query(collection(db, "attendance"), where("studentId", "==", studentId));
        const attSnap = await getDocs(attQuery);
        let p = 0, a = 0, l = 0;
        attSnap.forEach(record => {
          const status = record.data().status;
          if (status === "Present") p++;
          else if (status === "Absent") a++;
          else if (status === "Leave") l++;
        });
        setAttendanceStats({ present: p, absent: a, leave: l });

      } catch (error) {
        console.error("Error fetching profile: ", error);
      }
      setLoading(false);
    };

    if (user && role) {
       fetchStudentData();
    }
  }, [studentId, router, user, role]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3ac47d]"></div>
      </div>
    );
  }

  if (!student) return null;

  const totalDays = attendanceStats.present + attendanceStats.absent + attendanceStats.leave;
  const attendancePercentage = totalDays === 0 ? 0 : Math.round((attendanceStats.present / totalDays) * 100);

  // --- SECURITY CHECK 2: حساس ڈیٹا صرف ان کو نظر آئے گا ---
  const canViewSensitiveData = role === "admin" || role === "teacher" || role === "staff";

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#3ac47d] font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#3ac47d] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#2eaa6a]">
          <Printer size={16} /> Print Profile
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8 relative">
        <div className="h-40 bg-gradient-to-r from-[#3ac47d] to-[#1e9a5d] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={120} /></div>
        </div>
        
        <div className="px-8 pb-8 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
          <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-lg shrink-0">
            {student.photoBase64 ? (
              <img src={student.photoBase64} alt="Student" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <div className="w-full h-full rounded-xl bg-[#e8f8f0] text-[#3ac47d] flex items-center justify-center"><User size={48} /></div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left mb-2">
            <h1 className="text-3xl font-extrabold text-[#0F172A]">{student.name}</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Class {student.classGrade} {student.section && `- ${student.section}`} | Roll No: {student.rollNumber || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Personal Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2"><User size={16} /> Personal Identity</h3>
            <div className="space-y-4">
              <div><p className="text-xs text-gray-400">Date of Birth</p><p className="font-bold text-sm text-[#0F172A]">{student.dob || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Gender</p><p className="font-bold text-sm text-[#0F172A]">{student.gender || "N/A"}</p></div>
              <div><p className="text-xs text-gray-400">Religion</p><p className="font-bold text-sm text-[#0F172A]">{student.religion || "N/A"}</p></div>
            </div>
          </div>

          {/* SENSITIVE DATA BLOCK (Only Admin/Teacher/Staff) */}
          {canViewSensitiveData ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#3ac47d]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#e8f8f0] text-[#3ac47d] px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase flex items-center gap-1">
                <Lock size={10} /> Authorized Only
              </div>
              <h3 className="text-sm font-bold text-[#3ac47d] uppercase tracking-widest mb-5 flex items-center gap-2"><Phone size={16} /> Contact Details</h3>
              <div className="space-y-4">
                <div><p className="text-xs text-gray-400">Father's Name</p><p className="font-bold text-sm text-[#0F172A]">{student.fatherName}</p></div>
                <div><p className="text-xs text-gray-400">CNIC / B-Form</p><p className="font-bold text-sm text-[#0F172A]">{student.idNumber || "N/A"}</p></div>
                <div><p className="text-xs text-gray-400">Guardian Phone</p><p className="font-bold text-sm text-blue-600">{student.phone}</p></div>
                <div><p className="text-xs text-gray-400">Father's Profession</p><p className="font-bold text-sm text-[#0F172A]">{student.fatherProfession || "N/A"}</p></div>
                <div><p className="text-xs text-gray-400">Home Address</p><p className="font-bold text-sm text-[#0F172A]">{student.address || "N/A"}</p></div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-center flex flex-col items-center justify-center opacity-70">
               <Lock size={24} className="text-gray-400 mb-2" />
               <p className="text-xs font-bold text-gray-500">Sensitive Information</p>
               <p className="text-[10px] text-gray-400 mt-1">Only authorized staff can view contact details.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Stats & Academic Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><CheckSquare size={24} /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase">Attendance</p><p className="text-2xl font-black text-gray-800">{attendancePercentage}%</p></div>
            </div>
            
            {/* Fee Section (Hidden from teachers if you want, but for now visible) */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0"><CreditCard size={24} /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase">Total Fees Paid</p><p className="text-2xl font-black text-gray-800">Rs {feeTotal.toLocaleString()}</p></div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><Award size={24} /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase">Exams Taken</p><p className="text-2xl font-black text-gray-800">{marks.length}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-[#0F172A] mb-5 flex items-center gap-2"><BookOpen size={18} className="text-[#3ac47d]"/> Academic Performance</h3>
            {marks.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Activity size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-400">No exam records found for this student.</p>
              </div>
            ) : (
               <p className="text-sm text-gray-500">Marks data will appear here.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-[#3ac47d] font-bold">Loading Profile Engine...</div>}>
      <StudentProfileContent />
    </Suspense>
  );
}
