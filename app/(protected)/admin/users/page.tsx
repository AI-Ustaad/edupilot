"use client";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { TableSkeleton } from "@/components/Skeletons";
import { useUsers, useUpdateUserRole } from "@/hooks/useAdmin";

export default function ManageUsersPage() {
  const { data: users = [], isLoading, isError } = useUsers();
  const updateRoleMutation = useUpdateUserRole();

  if (isLoading) return <div className="p-8"><TableSkeleton rows={5} cols={4} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3"><AlertCircle size={32} /> Failed to load users.</div>;

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

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">User</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">Email</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">Current Role</th>
                <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">No users found</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold text-slate-800">{u.name || u.email.split("@")[0]}</td>
                    <td className="p-5 text-slate-500 font-medium">{u.email}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        u.role === "admin" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        u.role === "teacher" ? "bg-green-50 text-green-700 border-green-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>{u.role}</span>
                    </td>
                    <td className="p-5 text-right">
                      <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => updateRoleMutation.mutate({ uid: u.uid, role: e.target.value })}
                            disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.uid === u.uid}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-400 disabled:opacity-50 transition"
                          >
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="accountant">Accountant</option>
                            <option value="parent">Parent</option>
                          </select>
                          {updateRoleMutation.isPending && updateRoleMutation.variables?.uid === u.uid && <Loader2 size={16} className="animate-spin text-blue-500" />}
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
