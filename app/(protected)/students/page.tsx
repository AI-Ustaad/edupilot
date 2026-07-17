"use client";

import { useState } from "react";
import { Search, Users, ShieldCheck, Loader2, Filter } from "lucide-react";
// 🟢 Enterprise Imports
import { useStudentSync } from "@/hooks/api/useStudentSync";
import { useStudentDomain } from "@/hooks/runtime/useStudentDomain";

export default function StudentsDirectoryPage() {
  // 1. ⚙️ THE MOTOR: Start syncing data in background
  const { isSyncing, isError } = useStudentSync();

  // 2. 🚰 THE TAP: Access data via O(1) SDK (No Axios, No Direct API Calls)
  const { studentsById, totalStudentsLoaded } = useStudentDomain();

  // Local UI State for Search
  const [searchTerm, setSearchTerm] = useState("");

  // چونکہ ہمارا ڈیٹا Object (Record) میں ہے، ہم اسے دکھانے کے لیے Array میں بدل رہے ہیں
  const allStudents = Object.values(studentsById);

  // ⚡ Instant Local Filter (کیونکہ سارا ڈیٹا پہلے ہی Kernel میں موجود ہے)
  const filteredStudents = allStudents.filter(
    (std) =>
      std.personal.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.identity.admissionNumber.includes(searchTerm)
  );

  // Guard: Show full screen loader ONLY if we have no data at all and are syncing
  if (isSyncing && totalStudentsLoaded === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Hydrating Student Domain...</h2>
        <p className="text-slate-500">Loading enterprise records into memory</p>
      </div>
    );
  }

  if (isError && totalStudentsLoaded === 0) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl text-red-600 border border-red-100">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Domain Sync Failed</h2>
        <p>Could not connect to the Student Repository.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🟢 Enterprise Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Student Directory</h1>
            <p className="text-sm text-slate-500 font-medium">
              {totalStudentsLoaded} records loaded in Runtime Kernel
              {isSyncing && <span className="ml-2 text-blue-500 animate-pulse">(Syncing changes...)</span>}
            </p>
          </div>
        </div>
        
        {/* Instant Search Engine */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Name or Admission #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
      </div>

      {/* 🟢 Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div 
              key={student.studentId} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg">
                  {student.personal.firstName.charAt(0)}
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  student.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {student.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition">
                {student.personal.firstName} {student.personal.lastName}
              </h3>
              
              <div className="mt-3 space-y-1.5">
                <p className="text-xs text-slate-500 flex justify-between">
                  <span>Admission No:</span>
                  <span className="font-semibold text-slate-700">{student.identity.admissionNumber}</span>
                </p>
                <p className="text-xs text-slate-500 flex justify-between">
                  <span>Gender:</span>
                  <span className="font-semibold text-slate-700">{student.personal.gender}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            {totalStudentsLoaded === 0 ? "No students exist in the system." : "No matching students found."}
          </div>
        )}
      </div>
    </div>
  );
}
