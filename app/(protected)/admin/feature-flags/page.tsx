"use client";
import { useState, useEffect } from "react";
import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { useToast } from "@/components/ToastProvider";

const FEATURE_FLAGS = [
  { key: "transport", label: "Bus Tracking" },
  { key: "aiTimetable", label: "AI Timetable" },
  { key: "aiAssistant", label: "AI Chatbot" },
  { key: "aiExamGenerator", label: "AI Exam Generator" },
  { key: "videoLectures", label: "Video Lectures" },
  { key: "behavior", label: "Behavior Points" },
  { key: "skills", label: "Skills" },
  { key: "chat", label: "Chat" },
  { key: "assignments", label: "Assignments" },
  { key: "homework", label: "Homework" },
  { key: "quizzes", label: "Quizzes" },
  { key: "lessonPlans", label: "Lesson Plans" },
  { key: "bookCenter", label: "Book Center" },
  { key: "examCenter", label: "Exam Center" },
  { key: "admissions", label: "Admissions" },
  { key: "parents", label: "Parents" },
  { key: "leaveRequests", label: "Leave Requests" },
  { key: "advancedAnalytics", label: "Advanced Analytics" },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const res = await apiClient.get("/admin/feature-flags");
        setFlags(res.data || res || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, []);

  const toggle = async (feature: string, current: boolean) => {
    setUpdating(feature);
    try {
      await apiClient.post("/admin/feature-flags", { feature, enabled: !current });
      setFlags(prev => ({ ...prev, [feature]: !current }));
      showToast("Feature updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update feature.", "error");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Feature Flags</h1>
        <p className="text-sm text-gray-500">Enable or disable features for this school. Changes affect the sidebar immediately.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURE_FLAGS.map((f) => {
            const enabled = flags[f.key] !== false;
            return (
              <div key={f.key} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <span className="font-semibold text-gray-900">{f.label}</span>
                <button
                  onClick={() => toggle(f.key, enabled)}
                  disabled={updating === f.key}
                  className={`p-2 rounded-lg transition ${enabled ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                >
                  {updating === f.key ? <Loader2 className="animate-spin" size={24} /> : enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </RequirePermission>
  );
}
