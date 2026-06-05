"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Setup failed");

      // سیشن اپ ڈیٹ ہونے کے بعد ڈیش بورڈ پر جائیں
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Failed to register school. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full">
        <h1 className="text-3xl font-black mb-6 text-slate-800">Register School</h1>
        <input
          className="w-full p-4 rounded-2xl border-2 mb-6 text-slate-900"
          placeholder="Enter School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />
        <button
          onClick={handleFinish}
          className="w-full bg-blue-600 text-gray-900 p-4 rounded-2xl font-bold"
          disabled={loading}
        >
          {loading ? "Initializing..." : "Create School Account"}
        </button>
      </div>
    </div>
  );
}
