"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AttendanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Attendance Module Error:", error);
  }, [error]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center p-8">
      <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md shadow-sm">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-purple-500 w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Attendance Tracker Failed</h2>
        <p className="text-gray-500 mb-6 text-sm">
          We couldn&apos;t load the attendance records. Please check your connection or try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <RefreshCw size={16} /> Retry
          </button>
          <Link 
            href="/dashboard" 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <Home size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
