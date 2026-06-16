"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface User {
  uid: string;
  email: string;
  role: string;
  name?: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not load users");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (uid: string, newRole: string) => {
    setUpdating(uid);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, role: newRole }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Update failed");
      setSuccessMsg(`Role updated successfully!`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to update role");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
      </div>
    );
  }

  if (errorMsg && users.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block border border-red-100">
          <AlertCircle className="inline mr-2" size={20} />
          {errorMsg}
        </div>
        <button onClick={fetchUsers} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={28} /> Manage Users & Roles
          </h1>
          <p className="text-sm text-slate-500 mt-1">View and change roles of all users in your institution.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold shadow-sm">
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-bold shadow-sm">
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">User</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">Email</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">Current Role</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400 font-medium">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-medium text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <Users size={16} className="text-slate-500" />
                        </div>
                        <span className="font-bold text-gray-900">{u.name || u.email.split("@")[0]}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500 font-medium">{u.email}</td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] tracking-wider font-black uppercase border ${
                          u.role === "admin"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : u.role === "teacher"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {/* 🛡️ Protected Action (Role change) */}
                      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => updateRole(u.uid, e.target.value)}
                            disabled={updating === u.uid}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-400 disabled:opacity-50 transition"
                          >
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="accountant">Accountant</option>
                            <option value="parent">Parent</option>
                          </select>
                          {updating === u.uid && <Loader2 size={16} className="animate-spin text-blue-500" />}
                        </div>
                      </RequirePermission>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
