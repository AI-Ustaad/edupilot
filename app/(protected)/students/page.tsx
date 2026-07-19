// app/(protected)/students/page.tsx
"use client";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Loader2, Users, PlusCircle, Upload } from "lucide-react";
import Link from "next/link";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: students, isLoading, error } = useStudents();

  if (authLoading || isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading students...</p>
      </div>
    );
  }

  if (error || !students) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-red-600">Could not load students.</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          There was an issue connecting to the Student Repository. Please check your network connection or ensure the database indexes are created in Firebase.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-1">
            <Users className="text-blue-600" /> Students Directory
          </h1>
          <p className="text-sm text-gray-500">Manage student admissions, profiles, and records.</p>
        </div>
        
        <div className="flex gap-2">
          <RequirePermission permissions={[PERMISSIONS.students.create]}>
            <Link 
              href="/students/add" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm"
            >
              <PlusCircle size={18} /> Add Student
            </Link>
          </RequirePermission>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-medium shadow-sm">
          <Users className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-600 mb-1">No students found</h3>
          <p className="text-sm">Add students manually or use bulk import to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Name</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Class</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Section</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Roll No</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider hidden md:table-cell">Guardian</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider hidden md:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">
                      <Link href={`/students/${s.id}`} className="hover:text-blue-600 hover:underline">
                        {s.fullName || s.name || "N/A"}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{s.classGrade || "N/A"}</td>
                    <td className="p-4 text-gray-600 font-medium">{s.section || "N/A"}</td>
                    <td className="p-4 text-gray-600 font-medium">{s.rollNumber || "N/A"}</td>
                    <td className="p-4 text-gray-600 font-medium hidden md:table-cell">{s.guardianName || s.fatherName || "N/A"}</td>
                    <td className="p-4 hidden md:table-cell">
                      <Link 
                        href={`/students/${s.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
