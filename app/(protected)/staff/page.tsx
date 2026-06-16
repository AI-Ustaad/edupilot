"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function StaffDirectoryPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      setStaff(Array.isArray(data.data || data) ? (data.data || data) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    fetchStaff();
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.staff.view]}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Users className="text-blue-600"/> Staff Directory</h1>
            <p className="text-gray-500 text-sm">Manage teachers and administrative staff.</p>
          </div>
          <RequirePermission permissions={[PERMISSIONS.staff.create]}>
            <Link href="/staff/add" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition">
              <Plus size={18} /> Add Staff
            </Link>
          </RequirePermission>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600">Name</th>
                    <th className="p-4 font-bold text-gray-600">Role</th>
                    <th className="p-4 font-bold text-gray-600">Email</th>
                    <th className="p-4 font-bold text-right text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">No staff members found.</td></tr>
                  ) : (
                    staff.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-900">
                          <Link href={`/staff-profile?id=${s.id}`} className="hover:text-blue-600 hover:underline">{s.name || s.fullName}</Link>
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase">{s.role || "Staff"}</span>
                        </td>
                        <td className="p-4 text-gray-600 font-medium">{s.email}</td>
                        <td className="p-4 text-right">
                          <RequirePermission permissions={[PERMISSIONS.staff.delete]}>
                            <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18}/></button>
                          </RequirePermission>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
