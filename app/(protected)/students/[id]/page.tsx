"use client";
import { useStudent360 } from "@/hooks/useStudents";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, ArrowLeft, UserCircle, GraduationCap, Wallet, Activity, ClipboardCheck } from "lucide-react";

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Fetch all student data (Profile, Attendance, Fees, Marks) in one single call
  const { data, isLoading, error } = useStudent360(params.id);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading Student Profile...</p>
      </div>
    );
  }

  if (error || !data || !data.student) {
    return (
      <div className="p-8 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-red-600">Student Not Found</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          We couldn't load the profile for this student. They may not exist in the database or there was a network error.
        </p>
        <button 
          onClick={() => router.push("/students")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
        >
          <ArrowLeft size={18} /> Back to Students
        </button>
      </div>
    );
  }

  // Extract data safely
  const { student, attendance = [], fees = [], marks = [] } = data;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <button 
        onClick={() => router.push("/students")}
        className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2 transition"
      >
        <ArrowLeft size={18} /> Back to Directory
      </button>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <UserCircle size={64} />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-900">{student.fullName || student.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-gray-600 font-medium">
            <span className="flex items-center gap-1"><GraduationCap size={16} /> Class: {student.classGrade} - {student.section}</span>
            <span className="flex items-center gap-1"><UserCircle size={16} /> Roll No: {student.rollNumber || "N/A"}</span>
            <span className="flex items-center gap-1"><Activity size={16} /> Guardian: {student.guardianName || student.fatherName || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout for Data */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Attendance Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardCheck className="text-blue-600" /> Recent Attendance
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {attendance.length > 0 ? (
              attendance.slice(0, 10).map((att: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-600">{att.date}</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${att.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {att.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm font-medium">No attendance records found.</p>
            )}
          </div>
        </div>

        {/* Marks Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="text-purple-600" /> Recent Marks
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {marks.length > 0 ? (
              marks.slice(0, 10).map((m: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">{m.subject}</span>
                  <span className="font-bold text-gray-900">{m.marksObtained} / {m.totalMarks}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm font-medium">No marks records found.</p>
            )}
          </div>
        </div>

        {/* Fees Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm md:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet className="text-green-600" /> Fee History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b text-gray-500">
                <tr>
                  <th className="p-3">Month</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fees.length > 0 ? (
                  fees.slice(0, 5).map((f: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{f.feeMonth || "N/A"}</td>
                      <td className="p-3 text-gray-600">Rs {f.amountPaid || 0}</td>
                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${f.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {f.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{f.date || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400 font-medium">No fee records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
