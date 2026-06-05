export const dynamic = 'force-dynamic';
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Student {
  id: string;
  fullName: string;
  classGrade: string;
  section: string;
  rollNumber: number;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((json) => {
        // API returns { success: true, data: [...] }
        const data = json.data?.data || json.data || json;
        setStudents(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* یہ ہیڈنگ اب ہر موڈ میں واضح نظر آئے گی */}
      <h1 className="text-2xl font-black text-gray-100 bg-gray-900 px-6 py-4 rounded-2xl shadow">
        Fetch Students
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Roll No</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Section</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100">
                    <td className="p-3 font-medium">{student.rollNumber}</td>
                    <td className="p-3">{student.fullName}</td>
                    <td className="p-3">{student.classGrade}</td>
                    <td className="p-3">{student.section}</td>
                    <td className="p-3 text-center">
                      <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="leave">Leave</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
