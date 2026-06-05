"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Loader2, Search, AlertCircle } from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  userId: string;
  tenantId: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
  createdAt: any;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/audit", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    if (date?.toDate) return date.toDate().toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    if (typeof date === "string") return new Date(date).toLocaleString();
    return "N/A";
  };

  const filteredLogs = logs.filter((log) => {
    const search = filter.toLowerCase();
    return (
      log.action?.toLowerCase().includes(search) ||
      log.userId?.toLowerCase().includes(search) ||
      log.entityType?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white border border-gray-200 rounded-xl p-6 inline-block">
          <AlertCircle className="inline mr-2 text-red-500" size={20} />
          <span className="text-gray-900">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg block mx-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track all actions performed by users in your institution.</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by action, user ID, or entity..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase">Timestamp</th>
                <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase">Action</th>
                <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase">User ID</th>
                <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase">Entity</th>
                <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    {logs.length === 0 ? "No audit logs found." : "No logs match your filter."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4 whitespace-nowrap text-gray-600">{formatDate(log.createdAt)}</td>
                    <td className="p-4 font-mono text-xs font-bold text-blue-600">{log.action}</td>
                    <td className="p-4 font-mono text-xs text-gray-500">{log.userId?.slice(0, 10)}...</td>
                    <td className="p-4">
                      {log.entityType || "—"} {log.entityId && `(${log.entityId.slice(0, 6)})`}
                    </td>
                    <td className="p-4 max-w-xs truncate text-gray-500">
                      {log.metadata ? JSON.stringify(log.metadata).slice(0, 80) : "—"}
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
