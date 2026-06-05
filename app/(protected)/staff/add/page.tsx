"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AddStaffPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      personal: {
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
      },
      professional: {
        designation: formData.get("designation") as string,
        personnelNo: formData.get("personnelNo") as string,
      },
    };

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push("/staff"); // success → back to list
      } else {
        const err = await res.json();
        setError(err.message || "Failed to add staff");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Add Staff Member</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="fullName"
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            className="mt-1 w-full p-2 border border-gray-300 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            name="phone"
            className="mt-1 w-full p-2 border border-gray-300 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Designation</label>
          <input
            name="designation"
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Personnel No</label>
          <input
            name="personnelNo"
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-xl"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : "Add Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}
