"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Eye, FileText } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assignments")
      .then((res) => res.json())
      .then((data) => {
        // API ممکن ہے { success: true, data: [...] } یا براہِ راست ارے واپس کرے
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setAssignments(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <RequirePermission permissions={[PERMISSIONS.assignments.view]}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-600" /> Assignments
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create and manage student assignments.
            </p>
          </div>

          <RequirePermission permissions={[PERMISSIONS.assignments.create]}>
            <Link
              href="/teacher/assignments/create"   // اگر آپ کے پاس create page ہے
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
            >
              <Plus size={18} /> Create Assignment
            </Link>
          </RequirePermission>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-medium shadow-sm">
            No assignments posted yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Title</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Class / Section</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Due Date</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-900">{a.title}</td>
                    <td className="p-4 text-gray-600 font-medium">
                      {a.classGrade} - {a.section}
                    </td>
                    <td className="p-4 text-gray-500">
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/teacher/assignments/submissions?assignmentId=${a.id}`}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                      >
                        <Eye size={16} /> View Submissions
                      </Link>
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
