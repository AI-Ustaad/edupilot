"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Download, FileText } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function SubmissionsPage() {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentTitle, setAssignmentTitle] = useState("");

  useEffect(() => {
    if (!assignmentId) return;
    fetch(`/api/assignments/${assignmentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.title) setAssignmentTitle(data.title);
      })
      .catch(console.error);

    fetch(`/api/assignments/submit?assignmentId=${assignmentId}`)
      .then(res => res.json())
      .then(data => setSubmissions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.assignments.view]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" /> Submissions
          </h1>
          {assignmentTitle && <p className="text-gray-500 mt-1 font-medium">Assignment: <span className="text-gray-800 font-bold">{assignmentTitle}</span></p>}
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 shadow-sm font-medium">
            No submissions have been made by students yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Student</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">File</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs">Submitted At</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{sub.studentName}</td>
                      <td className="p-4 text-gray-600 font-medium">{sub.fileName}</td>
                      <td className="p-4 text-gray-500 font-medium">{new Date(sub.createdAt?.toDate?.()).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-bold transition">
                          <Download size={16} /> Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
