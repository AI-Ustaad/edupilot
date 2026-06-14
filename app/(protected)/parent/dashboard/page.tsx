"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, CalendarCheck, FileText, Upload, HelpCircle } from "lucide-react";

interface ChildInfo {
  id: string;
  fullName?: string;
  name?: string;
  classGrade?: string;
  section?: string;
  todayAttendance: string;
  latestMarks: any;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ children: ChildInfo[]; notices: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // اضافی سٹیٹس – quizzes، homework، اور assignments
  const [childQuizzes, setChildQuizzes] = useState<Record<string, any[]>>({});
  const [childHomework, setChildHomework] = useState<Record<string, any[]>>({});
  const [childAssignments, setChildAssignments] = useState<Record<string, any[]>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/parents/dashboard")
      .then(res => res.json())
      .then(async json => {
        if (json.success) {
          const children: ChildInfo[] = json.data.children;
          setData(json.data);

          // ہر بچے کے لیے الگ سے ڈیٹا لائیں
          const quizzesMap: Record<string, any[]> = {};
          const homeworkMap: Record<string, any[]> = {};
          const assignmentsMap: Record<string, any[]> = {};

          for (const child of children) {
            if (child.classGrade && child.section) {
              // Quizzes
              const quizRes = await fetch(
                `/api/quizzes?classGrade=${encodeURIComponent(child.classGrade)}&section=${encodeURIComponent(child.section || "")}`
              );
              const quizData = await quizRes.json();
              quizzesMap[child.id] = Array.isArray(quizData) ? quizData : [];

              // Homework
              const hwRes = await fetch(`/api/homework`);
              const hwData = await hwRes.json();
              // فلٹر صرف اس بچے کی کلاس/سیکشن کے لیے
              homeworkMap[child.id] = Array.isArray(hwData)
                ? hwData.filter(
                    (h: any) =>
                      h.classGrade === child.classGrade && (h.section === child.section || !h.section)
                  )
                : [];

              // Assignments
              const assignRes = await fetch(
                `/api/assignments?classGrade=${encodeURIComponent(child.classGrade)}&section=${encodeURIComponent(child.section || "")}`
              );
              const assignData = await assignRes.json();
              assignmentsMap[child.id] = Array.isArray(assignData) ? assignData : [];
            }
          }
          setChildQuizzes(quizzesMap);
          setChildHomework(homeworkMap);
          setChildAssignments(assignmentsMap);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleFileSubmit = async (child: ChildInfo, assignmentId: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(child.id);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("assignmentId", assignmentId);
        formData.append("studentId", child.id);
        formData.append("studentName", child.fullName || child.name || "Student");

        const res = await fetch("/api/assignments/submit", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          alert("File submitted successfully!");
        } else {
          const err = await res.json();
          alert("Failed: " + err.message);
        }
      } catch (err) {
        alert("Error uploading file");
      } finally {
        setUploading(null);
      }
    };
    fileInput.click();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!data || data.children.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No child linked to your account.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">My Child&apos;s Dashboard</h1>

      {data.children.map(child => (
        <div key={child.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {child.fullName || child.name || "Student"}
            </h2>
            <span className="text-sm text-gray-500">
              {child.classGrade} {child.section && `- ${child.section}`}
            </span>
          </div>

          {/* Attendance & Latest Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <CalendarCheck className="text-blue-600 w-8 h-8" />
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Attendance</p>
                <p className="text-xl font-bold text-gray-900">{child.todayAttendance}</p>
              </div>
            </div>
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

          {/* 🆕 Quizzes Section */}
          {childQuizzes[child.id] && childQuizzes[child.id].length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <HelpCircle className="text-orange-500" /> Quizzes
              </h3>
              <div className="space-y-3">
                {childQuizzes[child.id].map((quiz: any) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-900">{quiz.title}</p>
                    <p className="text-sm text-gray-600">
                      Subject: {quiz.subject} • Questions: {quiz.questions?.length || 0}
                    </p>
                    {quiz.dueDate && (
                      <p className="text-xs text-red-500">
                        Due: {new Date(quiz.dueDate.toDate?.() || quiz.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🆕 Homework Section */}
          {childHomework[child.id] && childHomework[child.id].length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="text-purple-600" /> Homework
              </h3>
              <div className="space-y-3">
                {childHomework[child.id].map((hw: any) => (
                  <div key={hw.id} className="border border-gray-200 rounded-xl p-4">
                    <p className="font-semibold text-gray-900">{hw.title}</p>
                    <p className="text-sm text-gray-600">{hw.description}</p>
                    {hw.tasks && (
                      <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                        {hw.tasks.map((t: string, i: number) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments (پہلے سے موجود) */}
          {childAssignments[child.id] && childAssignments[child.id].length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="text-pink-600" /> Assignments
              </h3>
              <div className="space-y-3">
                {childAssignments[child.id].map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{assignment.title}</p>
                      <p className="text-sm text-gray-600">{assignment.description}</p>
                      <p className="text-xs text-gray-400">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFileSubmit(child, assignment.id)}
                      disabled={uploading === child.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition"
                    >
                      {uploading === child.id ? "Uploading..." : <><Upload size={16} /> Submit File</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Notices */}
      {data.notices && data.notices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="text-purple-600" /> School Notices
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
