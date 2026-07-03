"use client";
import { useSearchParams } from "next/navigation";
import { BarChart, Users, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { TableSkeleton } from "@/components/Skeletons";

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["quizResults", quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const res = await apiClient.get(`/quizzes/results?quizId=${quizId}`);
      return safeArray(res);
    },
    enabled: !!quizId,
  });

  if (isLoading) return <div className="p-8"><TableSkeleton rows={5} cols={3} /></div>;

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
            <p className="text-3xl font-black text-green-600 mt-1">
              {results.length > 0 ? Math.round(results.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / results.length) : 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-gray-500 font-bold text-sm">Highest Score</p>
            <p className="text-3xl font-black text-blue-600 mt-1">
              {results.length > 0 ? Math.max(...results.map((r: any) => r.score || 0)) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <Users className="text-gray-600" size={20} />
            <h2 className="font-bold text-gray-800">Student Performance</h2>
          </div>
          {results.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">No students have taken this quiz yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600">Student Name</th>
                    <th className="p-4 font-bold text-gray-600">Score</th>
                    <th className="p-4 font-bold text-gray-600">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((res: any) => (
                    <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{res.studentName}</td>
                      <td className="p-4 font-bold text-blue-600">{res.score}%</td>
                      <td className="p-4 text-gray-500">{res.createdAt?.toDate ? new Date(res.createdAt.toDate()).toLocaleString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
