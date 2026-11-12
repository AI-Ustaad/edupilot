"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Clock, Users, CheckCircle2, XCircle, AlertCircle, Calendar, Save, Loader2, UserCheck, RefreshCw } from "lucide-react";
import { useStaff } from "@/hooks/useStaff";
import { useToast } from "@/components/ToastProvider";
import apiClient from "@/lib/api/client";

type AttendanceStatus = "present" | "absent" | "late" | "leave" | "not_marked";

export default function StaffAttendancePage() {
  const { data: staffList = [], isLoading: loadingStaff } = useStaff();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [entries, setEntries] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing records for selectedDate
  useEffect(() => {
    let isMounted = true;
    const fetchAttendance = async () => {
      if (!selectedDate) return;
      setLoadingRecords(true);
      try {
        const res = await apiClient.get(`/attendance/staff?date=${selectedDate}`);
        const data = (res as any)?.data || (res as any) || [];
        const records = Array.isArray(data) ? data : (data.records || []);

        if (isMounted) {
          const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
          records.forEach((r: any) => {
            const sid = r.staffId || r.id;
            if (sid) {
              map[sid] = {
                status: (r.status || "present").toLowerCase() as AttendanceStatus,
                remarks: r.remarks || "",
              };
            }
          });
          setEntries(map);
        }
      } catch (err) {
        console.error("Failed to load staff attendance:", err);
      } finally {
        if (isMounted) setLoadingRecords(false);
      }
    };

    fetchAttendance();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const activeStaff = useMemo(() => {
    return (staffList as any[]).filter(s => (s.status || "active").toLowerCase() === "active");
  }, [staffList]);

  // Fallback status is 'not_marked'
  const getStatus = (staffId: string): AttendanceStatus => {
    return entries[staffId]?.status || "not_marked";
  };

  const setStaffStatus = (staffId: string, status: AttendanceStatus) => {
    setEntries(prev => ({
      ...prev,
      [staffId]: {
        status,
        remarks: prev[staffId]?.remarks || "",
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = { ...entries };
    activeStaff.forEach(s => {
      const sid = s.staffId || s.id;
      if (sid) {
        updated[sid] = {
          status: "present",
          remarks: updated[sid]?.remarks || "",
        };
      }
    });
    setEntries(updated);
    showToast("All active staff marked as Present", "info");
  };

  const handleSave = async () => {
    if (activeStaff.length === 0) {
      showToast("No active staff found to record attendance", "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        date: selectedDate,
        records: activeStaff.map(s => {
          const sid = s.staffId || s.id;
          const entry = entries[sid];
          return {
            staffId: sid,
            staffName: s.fullName || s.name || "Staff Member",
            status: entry?.status || "present",
            remarks: entry?.remarks || "",
            date: selectedDate,
          };
        }),
      };

      await apiClient.post("/attendance/staff", payload);
      showToast(`Successfully saved attendance for ${activeStaff.length} staff members!`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to save staff attendance", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Metric counts
  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    activeStaff.forEach(s => {
      const sid = s.staffId || s.id;
      const st = getStatus(sid);
      if (st === "present") present++;
      else if (st === "absent") absent++;
      else if (st === "late") late++;
      else if (st === "leave") leave++;
    });

    return { total: activeStaff.length, present, absent, late, leave };
  }, [activeStaff, entries]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={28} /> Daily Staff Attendance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track daily attendance, punctuality, and leaves for faculty and administrative staff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-sm">
            <Calendar size={18} className="text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-sm text-gray-700 outline-none bg-transparent"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            disabled={activeStaff.length === 0}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl transition text-sm disabled:opacity-50"
          >
            <UserCheck size={16} /> Mark All Present
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || activeStaff.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-2.5 rounded-xl transition shadow-sm text-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Staff Attendance
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Staff</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{counts.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Present</p>
          <p className="text-2xl font-black text-green-700 mt-1">{counts.present}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-black text-red-700 mt-1">{counts.absent}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Late</p>
          <p className="text-2xl font-black text-yellow-700 mt-1">{counts.late}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">On Leave</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{counts.leave}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loadingStaff || loadingRecords ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-gray-400 font-bold">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            Loading staff attendance...
          </div>
        ) : activeStaff.length === 0 ? (
          <div className="p-16 text-center text-gray-400 font-bold">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            No active staff found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Staff Member</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeStaff.map((staff) => {
                  const sid = staff.staffId || staff.id;
                  const currentStatus = getStatus(sid);
                  const name = staff.fullName || staff.name || "Staff Member";
                  const desig = staff.designation || staff.role || "Teacher";
                  const dept = staff.department || "Academic";
                  const empId = staff.employeeId || staff.identity?.employeeId || `STF-${sid.slice(0, 4)}`;

                  return (
                    <tr key={sid} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-sm">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{name}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 text-sm">{desig}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                          {dept}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {currentStatus === "not_marked" && (
                            <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-lg">
                              Not Marked
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setStaffStatus(sid, "present")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              currentStatus === "present"
                                ? "bg-green-600 text-white shadow-sm ring-2 ring-green-600 ring-offset-1"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <CheckCircle2 size={14} /> Present
                          </button>

                          <button
                            type="button"
                            onClick={() => setStaffStatus(sid, "absent")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              currentStatus === "absent"
                                ? "bg-red-600 text-white shadow-sm ring-2 ring-red-600 ring-offset-1"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <XCircle size={14} /> Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => setStaffStatus(sid, "late")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              currentStatus === "late"
                                ? "bg-yellow-500 text-white shadow-sm ring-2 ring-yellow-500 ring-offset-1"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <Clock size={14} /> Late
                          </button>

                          <button
                            type="button"
                            onClick={() => setStaffStatus(sid, "leave")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              currentStatus === "leave"
                                ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            <AlertCircle size={14} /> On Leave
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
