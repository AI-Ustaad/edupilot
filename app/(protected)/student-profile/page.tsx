"use client";
import { useSearchParams } from "next/navigation";
import { Loader2, GraduationCap, MapPin, Phone, Mail, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStudent } from "@/hooks/useStudents";
import { CardSkeleton } from "@/components/Skeletons";

export default function StudentProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  // 🚀 Enterprise Hook
  const { data: profile, isLoading, isError } = useStudent(id || "");

  if (isLoading) return <div className="p-6 max-w-5xl mx-auto"><CardSkeleton /></div>;
  if (isError || !profile) return (
    <div className="p-8 text-center flex flex-col items-center gap-3 text-red-500">
      <AlertCircle size={32} /> Student profile not found.
    </div>
  );

  return (
    <RequirePermission permissions={[PERMISSIONS.students.view]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
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
