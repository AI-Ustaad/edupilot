"use client";

import React, { useEffect, useState } from "react";

interface JobProgressBarProps {
  jobId: string | null;
}

export function JobProgressBar({ jobId }: JobProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    // اگر جاب ID نہیں ہے، یا کام ختم/فیل ہو چکا ہے تو مزید API کالز نہ کریں
    if (!jobId || status === "completed" || status === "failed") return;

    // ہر 2 سیکنڈ بعد پروگریس چیک کریں (Polling)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/jobs/${jobId}`);
        const data = await res.json();
        
        if (data.success && data.job) {
          setProgress(data.job.progress || 0);
          setStatus(data.job.status);
        }
      } catch (error) {
        console.error("Failed to fetch job status", error);
      }
    }, 2000); 

    return () => clearInterval(interval); // کلین اپ (Clean up)
  }, [jobId, status]);

  // اگر کوئی کام شروع ہی نہیں ہوا تو کچھ نہ دکھائیں
  if (!jobId) return null;

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {status === "processing" && (
             <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
          )}
          {status === "pending" ? "Starting Job..." : 
           status === "processing" ? "Generating Reports in Background..." : 
           status === "completed" ? "✅ All Reports Generated Successfully!" : 
           status === "failed" ? "❌ Generation Failed" : "Starting..."}
        </span>
        <span className="text-sm font-bold text-blue-600">{progress}%</span>
      </div>
      
      {/* Animated Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            status === "completed" ? "bg-green-500" : 
            status === "failed" ? "bg-red-500" : "bg-blue-600"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {status === "completed" && (
        <p className="text-xs text-gray-500 mt-2">
          You will receive a notification with the download link shortly.
        </p>
      )}
    </div>
  );
}
