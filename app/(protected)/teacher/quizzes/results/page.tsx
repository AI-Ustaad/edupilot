export const dynamic = 'force-dynamic';
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState("");

  useEffect(() => {
    if (!quizId) return;
    fetch(`/api/quizzes/${quizId}`)
      .then(res => res.json())
      .then(data => { if (data.title) setQuizTitle(data.title); })
      .catch(console.error);

    fetch(`/api/quizzes/results?quizId=${quizId}`)
      .then(res => res.json())
      .then(data => setSubmissions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-2">Quiz Results</h1>
      {quizTitle && <p className="text-gray-500 mb-6">Quiz: {quizTitle}</p>}
      {submissions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">No submissions yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-center">Correct</th>
                <th className="p-4 text-center">Total</th>
                <th className="p-4 text-center">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub: any) => (
                <tr key={sub.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{sub.studentName}</td>
                  <td className="p-4 text-center text-green-600 font-bold">{sub.correct}</td>
                  <td className="p-4 text-center text-gray-600">{sub.total}</td>
                  <td className="p-4 text-center font-bold text-gray-900">{sub.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
