"use client";
import { useState } from "react";
import { Users, ShieldCheck, Loader2, CheckCircle2, AlertCircle, UserPlus, MoreVertical } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useUsers, useUpdateUserRole } from "@/hooks/useAdmin";
import { useToast } from "@/components/ToastProvider";
import { TableSkeleton } from "@/components/ui/skeleton/TableSkeleton"; // Make sure you have this skeleton

export default function ManageUsersPage() {
  const { data: users = [], isLoading, isError } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const { showToast } = useToast();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleRoleChange = (uid: string, role: string) => {
    updateRoleMutation.mutate({ uid, role });
  };

  if (isLoading) return <div className="p-8"><TableSkeleton rows={5} cols={4} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3"><AlertCircle size={32} /> Failed to load users.</div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={28} /> Users & Identity
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage user access, roles, and login activity.</p>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm"
          >
            <UserPlus size={18} /> Invite User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">User</th>
                  <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">Role</th>
                  <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider">Last Login</th>
                  <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-medium">No users found</td></tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                      {/* User Info */}
                      <td className="p-5 font-medium text-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {u.name?.charAt(0) || u.email?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{u.name || u.email?.split("@")[0]}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Role Selector */}
                      <td className="p-5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.uid === u.uid}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-blue-400 disabled:opacity-50 transition"
                        >
                          <option value="admin">Admin</option>
                          <option value="teacher">Teacher</option>
                          <option value="accountant">Accountant</option>
                          <option value="parent">Parent</option>
                          <option value="student">Student</option>
                        </select>
                      </td>

                      {/* Status Badge */}
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] tracking-wider font-black uppercase border ${
                          u.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' : 
                          u.status === 'invited' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="p-5 text-slate-500 text-sm">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never"}
                      </td>

                      {/* Actions (Placeholder for Suspend/Delete) */}
                      <td className="p-5 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite User Modal (UI Only for now) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">✕</button>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><UserPlus size={20} /> Invite New User</h2>
            <div className="space-y-4">
              <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-xl" />
              <select className="w-full p-3 border rounded-xl">
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
                <option value="parent">Parent</option>
              </select>
              <button 
                onClick={() => { showToast("Invitation sent successfully!", "success"); setShowInviteModal(false); }} 
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </RequirePermission>
  );
}
