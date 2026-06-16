"use client";
import { FileText, Plus, UploadCloud } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function ExamCenterPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
        <FileText className="text-blue-600" /> Exam Center
      </h1>

      {/* 🛡️ Protected Create Area */}
      <RequirePermission permissions={[PERMISSIONS.exams.create]}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Create New Exam</h2>
            <p className="text-gray-500 text-sm mt-2">Draft a new question paper directly in the portal.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition cursor-pointer group">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Upload Existing Exam</h2>
            <p className="text-gray-500 text-sm mt-2">Upload a PDF or Word document for upcoming exams.</p>
          </div>
        </div>
      </RequirePermission>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
        <h2 className="font-bold text-gray-800 mb-4">Recent Exams</h2>
        <div className="text-center text-gray-400 py-8 font-medium">
          No exams drafted recently.
        </div>
      </div>
    </div>
  );
}
