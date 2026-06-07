// app/error.tsx
"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center p-8">
      <div className="bg-red-50 border border-red-200 rounded-3xl p-10 max-w-md shadow-sm">
        <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition"
        >
          <RefreshCw size={18} /> Try Again
        </button>
      </div>
    </div>
  );
}
