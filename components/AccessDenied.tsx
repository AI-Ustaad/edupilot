"use client";

import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center p-8">
      <div className="bg-red-50 border border-red-200 rounded-3xl p-10 max-w-md shadow-sm w-full">
        <ShieldAlert className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-8">
          You do not have the required permissions to view this page. Please contact your administrator if this is a mistake.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    </div>
  );
}
