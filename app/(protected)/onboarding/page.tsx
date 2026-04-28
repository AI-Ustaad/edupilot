"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!schoolName) return alert("Enter school name");

    try {
      setLoading(true);

      const res = await fetch("/api/users/register-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolName,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      // ✅ IMPORTANT: Refresh token after claims set
      await fetch("/api/auth/session", {
        method: "POST",
      });

      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-[400px]">
        
        <h1 className="text-2xl font-bold mb-4">Setup Your School</h1>

        <input
          type="text"
          placeholder="School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="w-full mb-3 p-3 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 text-white p-3 rounded-lg font-bold"
        >
          {loading ? "Creating..." : "Create School"}
        </button>
      </div>
    </div>
  );
}
