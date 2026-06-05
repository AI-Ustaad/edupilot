export const dynamic = 'force-dynamic';
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Download, FileText } from "lucide-react";

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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-2">Submissions</h1>
      {assignmentTitle && <p className="text-gray-500 mb-6">Assignment: {assignmentTitle}</p>}
      {submissions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
          No submissions yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">File</th>
                <th className="p-4 text-left">Submitted</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub: any) => (
                <tr key={sub.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{sub.studentName}</td>
                  <td className="p-4 text-gray-600">{sub.fileName}</td>
                  <td className="p-4 text-gray-500">{new Date(sub.createdAt?.toDate?.()).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-bold">
                      <Download size={16} /> Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
