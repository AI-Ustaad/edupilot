"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, User, Mail, Phone, Briefcase } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function StaffProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/staff/${id}`)
      .then(res => res.json())
      .then(data => setProfile(data.data || data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  if (!profile) return <div className="p-8 text-center text-gray-500 font-bold">Staff profile not found.</div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.staff.view]}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-32 h-32 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg shrink-0">
            <User size={60} />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{profile.name || profile.fullName}</h1>
              <p className="text-blue-600 font-bold uppercase tracking-wider text-sm mt-1">{profile.role || "Staff Member"}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Mail size={18} className="text-gray-400" /> <span className="font-medium">{profile.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Phone size={18} className="text-gray-400" /> <span className="font-medium">{profile.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Briefcase size={18} className="text-gray-400" /> <span className="font-medium">Joined: {profile.joinDate || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
