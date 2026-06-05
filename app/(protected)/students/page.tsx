"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();

  const { data: studentsData, isLoading, isError } = useQuery({
    queryKey: ["students", user?.tenantId],
    queryFn: async () => {
      const res = await fetch("/api/v1/students");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      // Robust Handling for Array or {data: []} wrapper
      return Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
    },
    enabled: !!user?.tenantId && !authLoading,
  });

  const students = Array.isArray(studentsData) ? studentsData : [];

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (isError) return <div className="p-10 text-center text-red-500">Error loading data.</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black mb-6">Students Directory</h1>
      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full">
          <tbody>
            {students.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="p-5 font-bold">{s.fullName || s.name}</td>
                <td className="p-5">{s.classGrade}</td>
                <td className="p-5">{s.rollNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
