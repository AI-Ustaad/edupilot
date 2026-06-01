"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Users, Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface StaffMember {
  id: string;
  personal: {
    fullName: string;
    email?: string;
    phone?: string;
  };
  professional: {
    designation: string;
    personnelNo: string;
  };
}

export default function StaffPage() {
  const t = useTranslations("Staff");
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      // API returns { success: true, data: [...] }
      setStaffList(json.data || json);
    } catch (err) {
      console.error("Staff fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filtered = staffList.filter((s) =>
    s.personal?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-gray-900">Staff Management</h1>
        <button
          onClick={() => router.push("/staff/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No staff members found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((staff) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{staff.personal?.fullName}</h3>
                  <p className="text-sm text-gray-500">{staff.professional?.designation}</p>
                  <p className="text-xs text-gray-400 mt-1">{staff.personal?.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/staff/${staff.id}/edit`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this staff member?")) return;
                      await fetch(`/api/staff/${staff.id}`, { method: "DELETE" });
                      fetchStaff();
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
