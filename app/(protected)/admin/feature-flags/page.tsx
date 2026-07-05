"use client";
import { motion } from "framer-motion";
import { Loader2, ToggleLeft, ToggleRight, BookOpen, DollarSign, Bot } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useFeatureFlags, useToggleFeatureFlag } from "@/hooks/useAdmin";
import { CardSkeleton } from "@/components/ui/skeleton/CardSkeleton";

// Enterprise Feature Flag Definitions
const FEATURE_GROUPS = [
  {
    title: "Academic & Learning",
    icon: BookOpen,
    color: "text-blue-600",
    features: [
      { key: "assignments", label: "Assignments Module", description: "Allow teachers to create and grade assignments." },
      { key: "homework", label: "Homework Module", description: "Daily homework tracking and submission." },
      { key: "quizzes", label: "Quizzes & Tests", description: "Online quiz creation and auto-grading." },
      { key: "lessonPlans", label: "Lesson Planner", description: "Curriculum and daily lesson planning tools." },
      { key: "bookCenter", label: "Digital Book Center", description: "Upload and share PDFs and reading materials." },
    ]
  },
  {
    title: "Finance & Operations",
    icon: DollarSign,
    color: "text-green-600",
    features: [
      { key: "onlinePayments", label: "Online Fee Collection", description: "Enable Stripe/Card payments for fees." },
      { key: "transport", label: "Transport Module", description: "Bus tracking and route management." },
      { key: "leaveRequests", label: "Leave Requests", description: "Staff can apply for leaves digitally." },
    ]
  },
  {
    title: "Artificial Intelligence",
    icon: Bot,
    color: "text-purple-600",
    features: [
      { key: "aiAssistant", label: "AI Chatbot", description: "General AI assistant for teachers and admins." },
      { key: "aiExamGenerator", label: "AI Exam Generator", description: "Auto-generate MCQs and subjective questions." },
      { key: "aiTimetable", label: "AI Timetable", description: "Smart timetable scheduling with conflict resolution." },
    ]
  }
];

export default function EnterpriseFeatureFlagsPage() {
  const { data: flags = {}, isLoading } = useFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();

  if (isLoading) return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Feature Flags</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    </div>
  );

  const handleToggle = (feature: string, current: boolean) => {
    toggleMutation.mutate({ feature, enabled: !current });
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500">Enable or disable modules and features for your school in real-time.</p>
        </div>

        {FEATURE_GROUPS.map((group) => (
          <div key={group.title} className="space-y-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${group.color}`}>
              <group.icon size={22} /> {group.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.features.map((f) => {
                const enabled = flags[f.key] !== false; // Default true if not set
                const isUpdating = toggleMutation.isPending && toggleMutation.variables?.feature === f.key;
                
                return (
                  <motion.div
                    key={f.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white border rounded-2xl p-5 flex items-start justify-between shadow-sm transition-all ${enabled ? 'border-blue-200 ring-1 ring-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="flex-1 mr-4">
                      <p className="font-bold text-gray-900">{f.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{f.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(f.key, enabled)}
                      disabled={isUpdating}
                      className={`mt-1 p-2 rounded-lg transition ${enabled ? "text-blue-600 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-100"}`}
                    >
                      {isUpdating ? (
                        <Loader2 className="animate-spin" size={28} />
                      ) : enabled ? (
                        <ToggleRight size={32} />
                      ) : (
                        <ToggleLeft size={32} />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </RequirePermission>
  );
}
