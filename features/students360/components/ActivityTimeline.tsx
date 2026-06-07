"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  PenTool, Wallet, ClipboardCheck, UserPlus, AlertTriangle, 
  Loader2, Clock, FileText 
} from "lucide-react";

interface ActivityTimelineProps {
  studentId: string;
}

// Helper to map log actions to icons and colors
const getLogDetails = (action: string) => {
  switch (true) {
    case action.includes("marks"):
      return { icon: PenTool, color: "text-purple-600 bg-purple-100", label: "Marks Updated" };
    case action.includes("fees"):
      return { icon: Wallet, color: "text-green-600 bg-green-100", label: "Fee Processed" };
    case action.includes("attendance"):
      return { icon: ClipboardCheck, color: "text-blue-600 bg-blue-100", label: "Attendance Marked" };
    case action.includes("student.create"):
      return { icon: UserPlus, color: "text-indigo-600 bg-indigo-100", label: "Student Added" };
    case action.includes("delete"):
      return { icon: AlertTriangle, color: "text-red-600 bg-red-100", label: "Record Archived" };
    default:
      return { icon: FileText, color: "text-gray-600 bg-gray-100", label: "System Activity" };
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Just now";
  // Handle Firestore Timestamp or standard Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(date);
};

export default function ActivityTimeline({ studentId }: ActivityTimelineProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["studentTimeline", studentId],
    queryFn: async () => {
      // Note: Using /api/students/... because next.config.js rewrites it to /api/v1/...
      const res = await fetch(`/api/students/${studentId}/timeline`);
      if (!res.ok) throw new Error("Failed to fetch timeline");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-blue-500 mr-3" size={24} />
        <span className="text-slate-500 font-medium">Loading Activity History...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
        <Clock className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-slate-500 font-bold">No recent activity recorded for this student.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
        <Clock className="text-blue-500" size={20} /> Activity Timeline
      </h3>
      
      <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
        {data.map((log: any) => {
          const { icon: Icon, color, label } = getLogDetails(log.action);
          return (
            <div key={log.id} className="relative pl-8">
              {/* Timeline Dot */}
              <div className={`absolute -left-4 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${color}`}>
                <Icon size={14} />
              </div>
              
              {/* Content */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">{label}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Action: <span className="font-mono font-bold text-slate-700">{log.action}</span>
                </p>
                {log.metadata && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    Details: <span className="font-medium text-slate-600">
                      {log.metadata.subject ? `Subject: ${log.metadata.subject}` : 
                       log.metadata.feeMonth ? `Month: ${log.metadata.feeMonth}` : 
                       JSON.stringify(log.metadata).slice(0, 60)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
