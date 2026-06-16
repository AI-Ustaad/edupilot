/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, GraduationCap, MapPin, Phone, Mail } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function StudentProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/students/${id}`)
      .then(res => res.json())
      .then(data => setProfile(data.data || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (!profile) return <div className="p-8 text-center text-gray-500 font-bold">Student profile not found.</div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.students.view]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
          
          <div className="w-32 h-32 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center border-4 border-white shadow-lg shrink-0">
            {profile.photoUrl ? <img src={profile.photoUrl} alt="Student" className="w-full h-full object-cover rounded-2xl" /> : <GraduationCap size={50} />}
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-gray-900">{profile.fullName || profile.name}</h1>
              <p className="text-blue-600 font-bold text-sm mt-1">Roll No: {profile.rollNumber} • Class: {profile.classGrade}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Guardian Details</p>
                <div className="flex items-center gap-2 text-gray-700 font-medium"><Phone size={16} className="text-blue-500"/> {profile.parentPhone || "N/A"}</div>
                <div className="flex items-center gap-2 text-gray-700 font-medium mt-2"><Mail size={16} className="text-blue-500"/> {profile.parentEmail || "N/A"}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Address Info</p>
                <div className="flex items-start gap-2 text-gray-700 font-medium"><MapPin size={16} className="text-red-500 mt-0.5 shrink-0"/> {profile.address || "No address provided."}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
