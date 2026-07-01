"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertTriangle, User, Mail, Phone, MapPin, Calendar, Users, BookOpen, CreditCard, Activity } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import Image from "next/image";

export default function Student360Page() {
  const params = useParams();
  const studentId = params?.id as string;
  const { user } = useAuth();

  const { data: student, isLoading, isError, error } = useQuery({
    queryKey: ["student360", studentId, user?.tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/students/${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch student 360 data");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "API Error");
      return json.data; // یہاں سے سیدھا Student کا Object آئے گا
    },
    enabled: !!user?.tenantId && !!studentId,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <p className="text-gray-500 font-medium">Loading 360° Student Profile...</p>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-red-50 rounded-2xl border border-red-200 max-w-2xl mx-auto mt-10">
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Failed to Load Profile</h2>
        <p className="text-gray-600 mt-2">{error?.message || "Student not found or you lack permissions."}</p>
      </div>
    );
  }

  return (
    <RequirePermission permissions={[PERMISSIONS.students.view]}>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        
        {/* 📸 Header Card with Real Photo & Basic Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {student?.photoBase64 ? (
                <Image 
                  src={student.photoBase64} 
                  alt={student.fullName || "Student Photo"} 
                  width={128} 
                  height={128} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-50" 
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-blue-50">
                  <User className="text-gray-400" size={48} />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black text-gray-900">{student?.fullName || "N/A"}</h1>
              <p className="text-md text-gray-500 font-medium mt-1">
                Student ID: {studentId} | Admission No: {student?.admissionNumber || "N/A"}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-sm font-bold">
                  Class: {student?.classGrade || "N/A"}
                </span>
                <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-full text-sm font-bold">
                  Section: {student?.section || "N/A"}
                </span>
                <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-sm font-bold">
                  Roll No: {student?.rollNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 Grid Layout for Original Student Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Personal Information */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-blue-600" size={20} /> Personal Information
            </h2>
            <div className="space-y-3 text-sm">
              <InfoRow icon={<Users size={16} />} label="Father Name" value={student?.fatherName} />
              <InfoRow icon={<Calendar size={16} />} label="Date of Birth" value={student?.dob} />
              <InfoRow icon={<CreditCard size={16} />} label="CNIC / B-Form" value={student?.cnic} />
              <InfoRow icon={<Activity size={16} />} label="Blood Group" value={student?.bloodGroup} />
              <InfoRow icon={<Mail size={16} />} label="Email" value={student?.email} />
              <InfoRow icon={<Phone size={16} />} label="Phone" value={student?.phone} />
              <InfoRow icon={<MapPin size={16} />} label="Address" value={student?.address} />
            </div>
          </div>

          {/* Guardian Information */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-green-600" size={20} /> Guardian Details
            </h2>
            <div className="space-y-3 text-sm">
              <InfoRow icon={<User size={16} />} label="Guardian Name" value={student?.guardianName} />
              <InfoRow icon={<Users size={16} />} label="Relation" value={student?.guardianRelation} />
              <InfoRow icon={<Phone size={16} />} label="Guardian Phone" value={student?.guardianPhone} />
              <InfoRow icon={<BookOpen size={16} />} label="Previous School" value={student?.previousSchool} />
              <InfoRow icon={<AlertTriangle size={16} />} label="Medical Conditions" value={student?.medicalConditions || "None"} />
            </div>
          </div>

          {/* Academic & System Info */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="text-purple-600" size={20} /> Academic Record
            </h2>
            <div className="space-y-3 text-sm">
              <InfoRow icon={<Calendar size={16} />} label="Admission Date" value={student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"} />
              <InfoRow icon={<BookOpen size={16} />} label="Current Status" value={student?.status || "Active"} />
              <InfoRow icon={<Activity size={16} />} label="Religion" value={student?.religion} />
              <InfoRow icon={<MapPin size={16} />} label="Nationality" value={student?.nationality} />
              
              <div className="pt-4 border-t border-gray-100 mt-4">
                <p className="text-gray-400 text-xs font-bold uppercase mb-2">Quick Actions</p>
                <button className="w-full bg-blue-50 text-blue-600 font-bold py-2 rounded-xl hover:bg-blue-100 transition text-sm">View Attendance</button>
                <button className="w-full bg-green-50 text-green-600 font-bold py-2 rounded-xl hover:bg-green-100 transition mt-2 text-sm">View Fee History</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </RequirePermission>
  );
}

// 🛠️ Helper Component for clean UI rows
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <span className="text-gray-500 font-medium flex items-center gap-2">{icon} {label}</span>
      <span className="text-gray-900 font-bold text-right">{value || "N/A"}</span>
    </div>
  );
}
