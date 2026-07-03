"use client";
import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAuditLogs } from "@/hooks/useAdmin";
import { TableSkeleton } from "@/components/Skeletons";

export default function AuditLogsPage() {
  const { data: logs = [], isLoading, isError } = useAuditLogs();
  const [filter, setFilter] = useState("");

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date?.toDate) return date.toDate().toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    if (typeof date === "string") return new Date(date).toLocaleString();
    return "N/A";
  };

  const filteredLogs = logs.filter((log: any) => {
    const search = filter.toLowerCase();
    return log.action?.toLowerCase().includes(search) || log.userId?.toLowerCase().includes(search);
  });

  if (isLoading) return <div className="p-6"><TableSkeleton rows={6} cols={5} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3"><AlertCircle size={32} /> Failed to load audit logs.</div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.audit.view]}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all actions performed by users.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by action or user ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">User ID</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-medium">No logs found.</td></tr>
                ) : (
                  filteredLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 whitespace-nowrap text-gray-600 font-medium">{formatDate(log.createdAt)}</td>
                      <td className="p-4 font-mono text-xs font-bold text-blue-600 bg-blue-50/50 rounded-lg">{log.action}</td>
                      <td className="p-4 font-mono text-xs text-gray-500">{log.userId?.slice(0, 10)}...</td>
                      <td className="p-4 text-gray-700 font-medium">{log.entityType || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
