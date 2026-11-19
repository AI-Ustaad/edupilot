"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search, AlertCircle, Filter, Download, ShieldCheck, History, Calendar, UserCheck } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAuditLogs } from "@/hooks/useAdmin";
import { TableSkeleton } from "@/components/ui/skeleton/TableSkeleton";
import { useToast } from "@/components/ToastProvider";

export default function EnterpriseAuditCenter() {
  const { data: logs = [], isLoading, isError } = useAuditLogs();
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { showToast } = useToast();

  const parseTimestamp = (date: any): Date | null => {
    if (!date) return null;
    if (typeof date?.toDate === "function") return date.toDate();
    if (date instanceof Date) return isNaN(date.getTime()) ? null : date;
    if (date?._seconds !== undefined) return new Date(date._seconds * 1000);
    if (date?.seconds !== undefined) return new Date(date.seconds * 1000);
    if (typeof date === "number") {
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof date === "string") {
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const formatDate = (date: any) => {
    const d = parseTimestamp(date);
    if (!d) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  // Extract unique actions for filter dropdown
  const uniqueActions = ["all", ...new Set(logs.map((log: any) => log.action?.split('.')[0]).filter(Boolean))];

  const filteredLogs = logs.filter((log: any) => {
    const searchLower = filter.toLowerCase().trim();
    const searchMatch = filter === "" || 
      log.action?.toLowerCase().includes(searchLower) ||
      log.userId?.toLowerCase().includes(searchLower) ||
      log.userName?.toLowerCase().includes(searchLower) ||
      log.userEmail?.toLowerCase().includes(searchLower) ||
      log.entityType?.toLowerCase().includes(searchLower) ||
      log.entityId?.toLowerCase().includes(searchLower);
    
    const actionMatch = actionFilter === "all" || log.action?.startsWith(actionFilter);

    // Date range filtering
    let dateMatch = true;
    if (startDate || endDate) {
      const logDate = parseTimestamp(log.createdAt);
      if (!logDate) {
        dateMatch = false;
      } else {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) dateMatch = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) dateMatch = false;
        }
      }
    }
    
    return searchMatch && actionMatch && dateMatch;
  });

  const handleExport = () => {
    const headers = ["Timestamp", "Action", "User Name", "User Email", "User ID", "Entity Type", "Entity ID"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log: any) => [
        `"${formatDate(log.createdAt)}"`,
        `"${log.action || ""}"`,
        `"${log.userName || ""}"`,
        `"${log.userEmail || ""}"`,
        `"${log.userId || ""}"`,
        `"${log.entityType || ""}"`,
        `"${log.entityId || ""}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
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
            <p className="text-sm text-gray-500 mt-1">Track all user activities and system changes with actor identity and timestamps.</p>
          </div>
          <button 
            onClick={handleExport}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition text-sm shadow-sm"
          >
            <Download size={16} /> Export to CSV
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by User, Email, Action, or Entity..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 transition text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 font-medium bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action === "all" ? "All Categories" : action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Controls */}
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium bg-gray-50 p-1.5 border border-gray-200 rounded-xl">
            <Calendar size={16} className="text-gray-400 ml-1" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-0 outline-none p-1 text-gray-800"
              title="From Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-0 outline-none p-1 text-gray-800"
              title="To Date"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 rounded hover:bg-white"
              >
                Clear
              </button>
            )}
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
            <div className="p-12 text-center text-gray-400 font-medium">No audit logs match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600">Timestamp</th>
                    <th className="p-4 font-bold text-gray-600">Action</th>
                    <th className="p-4 font-bold text-gray-600">User / Actor</th>
                    <th className="p-4 font-bold text-gray-600">Entity Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log: any, idx: number) => {
                    const formattedTime = formatDate(log.createdAt);
                    return (
                      <motion.tr 
                        key={log.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 whitespace-nowrap text-gray-700 font-medium text-xs">
                          {formattedTime}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4">
                          {log.userName || log.userEmail ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                <UserCheck size={13} className="text-blue-500" />
                                {log.userName || log.userEmail}
                                {log.userRole && (
                                  <span className="text-[10px] uppercase font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded border">
                                    {log.userRole}
                                  </span>
                                )}
                              </span>
                              {log.userEmail && log.userName && (
                                <span className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  {log.userEmail}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-gray-400" title={log.userId}>
                              {log.userId?.slice(0, 10)}...
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-700 font-medium text-xs">
                          {log.entityType ? (
                            <span>
                              <span className="font-semibold text-gray-800">{log.entityType}</span>
                              {log.entityId && (
                                <span className="text-gray-400 font-mono text-[11px] ml-1.5">
                                  ({log.entityId.slice(0, 8)})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
