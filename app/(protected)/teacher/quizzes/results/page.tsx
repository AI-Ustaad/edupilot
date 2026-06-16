"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Users, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setResults([]);
      setLoading(false);
    }, 1000);
  }, [quizId]);

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.quizzes.view]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <BarChart className="text-blue-600" /> Quiz Results & Analytics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-gray-500 font-bold text-sm">Total Submissions</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{results.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-gray-500 font-bold text-sm">Average Score</p>
            <p className="text-3xl font-black text-green-600 mt-1">0%</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-gray-500 font-bold text-sm">Highest Score</p>
            <p className="text-3xl font-black text-blue-600 mt-1">0</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Users className="text-gray-600" size={20} />
            <h2 className="font-bold text-gray-800">Student Performance</h2>
          </div>
          {results.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">
              No students have taken this quiz yet.
            </div>
          ) : (
            <div className="p-4">Results will appear here.</div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
