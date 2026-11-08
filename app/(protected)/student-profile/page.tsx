"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Loader2, 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle, 
  Search, 
  User, 
  ArrowRight,
  Eye
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStudent, useStudents } from "@/hooks/useStudents";
import { CardSkeleton } from "@/components/Skeletons";

export default function StudentProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Single student query
  const { data: profile, isLoading, isError } = useStudent(id || "");

  // Student directory fallback when no id is provided
  const { data: studentsData, isLoading: listLoading } = useStudents();
  const students: any[] = Array.isArray(studentsData) ? studentsData : [];

  const filteredStudents = useMemo(() => {
    if (!students.length) return [];
    const term = searchTerm.toLowerCase().trim();
    return students
      .filter((s: any) => {
        if (!term) return true;
        const name = String(s.fullName || s.name || "").toLowerCase();
        const roll = String(s.rollNumber || "").toLowerCase();
        const cls = String(s.classGrade || s.class || "").toLowerCase();
        return name.includes(term) || roll.includes(term) || cls.includes(term);
      })
      .sort((a: any, b: any) => {
        const rollA = Number(String(a.rollNumber || "").replace(/\D/g, "")) || 0;
        const rollB = Number(String(b.rollNumber || "").replace(/\D/g, "")) || 0;
        return rollA - rollB;
      });
  }, [students, searchTerm]);

  // When no ID is passed in the URL, show student picker directory
  if (!id) {
    return (
      <RequirePermission permissions={[PERMISSIONS.students.view]}>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-2">
              <GraduationCap className="text-blue-600" size={28} /> Student Profiles
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Select a student to view their academic profile, attendance, and details.
            </p>

            {/* Search Input */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by student name, roll number, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {listLoading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">No students found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filteredStudents.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/students/${s.id}`}
                    className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                        {String(s.fullName || s.name || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-blue-600 text-sm">
                          {s.fullName || s.name || "Unnamed Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Roll #{s.rollNumber || "N/A"} • {s.classGrade || s.class || "Class N/A"} {s.section ? `(${s.section})` : ""}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 transition shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </RequirePermission>
    );
  }

  if (isLoading) return <div className="p-6 max-w-5xl mx-auto"><CardSkeleton /></div>;
  if (isError || !profile) return (
    <div className="p-8 text-center flex flex-col items-center gap-3 text-red-500">
      <AlertCircle size={32} /> Student profile not found.
      <Link href="/students" className="text-blue-600 text-sm font-bold hover:underline mt-2">
        Return to Students Directory
      </Link>
    </div>
  );

  return (
    <RequirePermission permissions={[PERMISSIONS.students.view]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <Link href="/students" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            ← Back to Students
          </Link>
          <Link 
            href={`/students/${id}`} 
            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Eye size={14} /> Full 360° Profile
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
          <div className="w-32 h-32 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center border-4 border-white shadow-lg shrink-0">
            <GraduationCap size={50} />
          </div>
          <div className="flex-1 w-full space-y-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-gray-900">{profile.fullName || profile.name}</h1>
              <p className="text-blue-600 font-bold text-sm mt-1">Roll No: {profile.rollNumber || "N/A"} • Class: {profile.classGrade || "N/A"}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Guardian Details</p>
                <div className="flex items-center gap-2 text-gray-700 font-medium"><Phone size={16} className="text-blue-500"/> {profile.guardianPhone || profile.parentPhone || "N/A"}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Address Info</p>
                <div className="flex items-center gap-2 text-gray-700 font-medium"><MapPin size={16} className="text-red-500 mt-0.5 shrink-0"/> {profile.address || "No address provided."}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
