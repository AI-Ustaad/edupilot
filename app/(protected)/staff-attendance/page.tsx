"use client";
import { Clock, Users } from "lucide-react";

export default function StaffAttendancePage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Clock className="text-blue-600" /> Staff Attendance
        </h1>
        <p className="text-gray-500 text-sm">Mark and track staff attendance records.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <Users size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="font-bold text-gray-600">Staff Attendance Module</p>
        <p className="text-sm text-gray-400 mt-2">
          Staff attendance tracking is integrated with the main Attendance module.
          Individual staff attendance records are available in each staff member&apos;s profile under the Attendance tab.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a href="/attendance" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">
            Go to Attendance
          </a>
          <a href="/staff" className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition">
            Staff Directory
          </a>
        </div>
      </div>
    </div>
  );
}
