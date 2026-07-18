"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center p-8">
      <div className="bg-red-50 border border-red-200 rounded-3xl p-10 max-w-lg shadow-sm">
        <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong! (Debug Mode)</h2>
        
        {/* 🚀 RULE 24: Exact Error Trace for Developer (Message, Stack, Digest) */}
        <div className="text-left bg-red-100 p-4 rounded-xl overflow-auto mt-4 mb-6 text-xs text-red-800 font-mono whitespace-pre-wrap break-all">
          <p><strong>Message:</strong> {error?.message || "No message available"}</p>
          {error?.stack && (
            <p className="mt-2"><strong>Stack Trace:</strong> {"\n"} {error.stack}</p>
          )}
          {error?.digest && (
            <p className="mt-2"><strong>Digest:</strong> {error.digest}</p>
          )}
        </div>
        
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
