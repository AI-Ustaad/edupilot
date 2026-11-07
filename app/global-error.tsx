"use client";

import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error telemetry (no raw stack traces exposed to end users)
    console.error("[GlobalErrorTelemetry]", {
      message: error?.message,
      digest: error?.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Critical System Error</h1>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            The application encountered a critical runtime exception. The system error has been captured and logged.
          </p>

          {error?.digest && (
            <p className="text-xs text-gray-400 font-mono mb-6 bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100">
              {`Reference ID: ${error.digest}`}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm active:scale-95"
            >
              <RefreshCw size={16} /> Try Again
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-95"
            >
              <LayoutDashboard size={16} /> Return to Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
