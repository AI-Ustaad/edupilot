"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, AlertCircle, Filter, Download, ShieldCheck, History } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAuditLogs } from "@/hooks/useAdmin";
import { TableSkeleton } from "@/components/ui/skeleton/TableSkeleton";
import { useToast } from "@/components/ToastProvider";

export default function EnterpriseAuditCenter() {
  const { data: logs = [], isLoading, isError } = useAuditLogs();
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const { showToast } = useToast();

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date?.toDate) return date.toDate().toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    if (typeof date === "string") return new Date(date).toLocaleString();
    return "N/A";
  };

  // Extract unique actions for filter dropdown
  const uniqueActions = ["all", ...new Set(logs.map((log: any) => log.action?.split('.')[0]))];

  const filteredLogs = logs.filter((log: any) => {
    const searchMatch = filter === "" || 
      log.action?.toLowerCase().includes(filter.toLowerCase()) ||
      log.userId?.toLowerCase().includes(filter.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(filter.toLowerCase());
    
    const actionMatch = actionFilter === "all" || log.action?.startsWith(actionFilter);
    
    return searchMatch && actionMatch;
  });

  const handleExport = () => {
    // Simple CSV Export Logic
    const headers = ["Timestamp", "Action", "User ID", "Entity Type", "Entity ID"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log: any) => [
        formatDate(log.createdAt),
        log.action,
        log.userId,
        log.entityType || "",
        log.entityId || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast("Audit logs exported successfully!", "success");
  };

  if (isLoading) return <div className="p-6"><TableSkeleton rows={8} cols={4} /></div>;
  if (isError) return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3"><AlertCircle size={32} /> Failed to load audit logs.</div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.audit.view]}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={28} /> Audit Center
            </h1>
            <p className="text-sm text-gray-500 mt-1">Track all user activities and system changes for compliance.</p>
          </div>
          <button 
            onClick={handleExport}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition text-sm"
          >
            <Download size={16} /> Export to CSV
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by User ID, Entity, or Action..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 font-medium bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action === "all" ? "All Categories" : action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Timeline Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
            <span className="flex items-center gap-2"><History size={18} /> Activity Timeline</span>
            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border">
              {filteredLogs.length} Records
            </span>
          </div>
          
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">No logs match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600">Timestamp</th>
                    <th className="p-4 font-bold text-gray-600">Action</th>
                    <th className="p-4 font-bold text-gray-600">User</th>
                    <th className="p-4 font-bold text-gray-600">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log: any, idx: number) => (
                    <motion.tr 
                      key={log.id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap text-gray-500 font-medium text-xs">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-500">
                        {log.userId?.slice(0, 8)}...
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {log.entityType || "—"} 
                        {log.entityId && <span className="text-gray-400 text-xs ml-1">({log.entityId.slice(0, 6)})</span>}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
