"use client";
import { Loader2, Plus, Eye, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAssignments, useDeleteAssignment } from "@/hooks/useTeacher";
import { TableSkeleton } from "@/components/Skeletons";

import type { Assignment } from "@/types/teacher";

export default function TeacherAssignmentsPage() {
  const { data: assignments = [], isLoading } = useAssignments();
  const deleteMutation = useDeleteAssignment(); // 🚀 Delete Hook

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-8"><TableSkeleton rows={4} cols={4} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.assignments.view]}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><FileText className="text-blue-600" /> Assignments</h1>
          <RequirePermission permissions={[PERMISSIONS.assignments.create]}>
            <Link href="/teacher/assignments/create" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition">
              <Plus size={18} /> Create Assignment
            </Link>
          </RequirePermission>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 font-medium shadow-sm">No assignments posted yet.</div>
        ) : (
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Title</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Class / Section</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Due Date</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a) => (
                  <tr key={a.id} className={`hover:bg-gray-50 transition ${deleteMutation.isPending && deleteMutation.variables === a.id ? 'opacity-50' : ''}`}>
                    <td className="p-4 font-bold text-gray-900">{a.title}</td>
                    <td className="p-4 text-gray-600 font-medium">{a.classGrade} - {a.section}</td>
                    <td className="p-4 text-gray-500">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <Link href={`/teacher/assignments/submissions?assignmentId=${a.id}`} className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg inline-flex items-center gap-1 text-sm font-bold border border-blue-100 transition">
                          <Eye size={16} /> View
                        </Link>
                        <RequirePermission permissions={[PERMISSIONS.assignments.create]}>
                          <button 
                            onClick={() => handleDelete(a.id)} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === a.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
