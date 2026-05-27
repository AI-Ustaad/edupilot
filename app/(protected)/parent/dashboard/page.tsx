"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, CalendarCheck, FileText } from "lucide-react";

interface ChildInfo {
  id: string;
  fullName?: string;
  name?: string;
  classGrade?: string;
  todayAttendance: string;
  latestMarks: any;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ children: ChildInfo[]; notices: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch("/api/parents/dashboard")
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        else console.error("Parent dashboard error:", json.message);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading your child's information...
      </div>
    );
  }

  if (!data || data.children.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No child linked to your account. Please contact school administration.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Child's Dashboard</h1>

      {data.children.map((child) => (
        <div key={child.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {child.fullName || child.name || "Student"}
            </h2>
            <span className="text-sm text-gray-500">{child.classGrade}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Today's Attendance */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <CalendarCheck className="text-blue-600 w-8 h-8" />
              <div>
                <p className="text-sm text-gray-600">Today's Attendance</p>
                <p className="text-xl font-bold text-gray-900">{child.todayAttendance}</p>
              </div>
            </div>

            {/* Latest Exam Marks */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <BookOpen className="text-green-600 w-8 h-8" />
              <div>
                <p className="text-sm text-gray-600">Latest Exam Marks</p>
                {child.latestMarks ? (
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {child.latestMarks.subject}: {child.latestMarks.marksObtained}/{child.latestMarks.totalMarks}
                    </p>
                    <p className="text-xs text-gray-500">
                      {child.latestMarks.term} • Grade: {child.latestMarks.grade}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No marks available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* School Notices / Homework */}
      {data.notices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="text-purple-600" /> School Notices & Homework
          </h2>
          <div className="space-y-3">
            {data.notices.map((notice: any) => (
              <div key={notice.id} className="border border-gray-100 rounded-xl p-3">
                <p className="font-semibold text-gray-800">{notice.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notice.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notice.createdAt?.toDate?.()).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
