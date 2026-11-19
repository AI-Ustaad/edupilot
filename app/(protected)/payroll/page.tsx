"use client";

import React, { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Download, 
  Printer, 
  X, 
  FileText, 
  Search, 
  Building2, 
  Calendar,
  CreditCard,
  Briefcase
} from "lucide-react";
import apiClient from "@/lib/api/client";
import { useToast } from "@/components/ToastProvider";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSettings } from "@/hooks/useSettings";

const MONTHS = [
  "November 2026",
  "October 2026",
  "September 2026",
  "August 2026",
  "July 2026",
  "June 2026",
  "May 2026",
  "April 2026",
  "March 2026",
  "February 2026",
  "January 2026",
  "December 2026",
];

export default function PayrollPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();

  const schoolName = settings?.schoolName || (settings as any)?.school?.name || "Government High School Sahiwal";
  const subtitle = settings?.affiliation || "Punjab Education Department • Government of the Punjab";

  const [selectedMonth, setSelectedMonth] = useState("November 2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [activePayslip, setActivePayslip] = useState<any | null>(null);
  const payslipRef = useRef<HTMLDivElement>(null);

  // Fetch Payroll Data
  const { data: payrollData, isLoading, isFetching } = useQuery({
    queryKey: ["payroll", selectedMonth],
    queryFn: async () => {
      const res = await apiClient.get(`/payroll?month=${encodeURIComponent(selectedMonth)}`);
      return res.data;
    },
  });

  const summary = payrollData?.data;
  const records = useMemo(() => summary?.records || [], [summary]);

  // Filter staff records by search query
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const q = searchTerm.toLowerCase().trim();
    return records.filter((r: any) => 
      r.name?.toLowerCase().includes(q) ||
      r.employeeId?.toLowerCase().includes(q) ||
      r.designation?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q)
    );
  }, [records, searchTerm]);

  // Mutation: Mark Single Staff Paid/Pending
  const markStatusMutation = useMutation({
    mutationFn: async ({ staffId, status }: { staffId: string; status: "Paid" | "Pending" }) => {
      const res = await apiClient.post("/payroll", {
        staffId,
        month: selectedMonth,
        status,
        paymentMethod: "Bank Transfer",
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      showToast(`Staff marked as ${variables.status}!`, "success");
      queryClient.invalidateQueries({ queryKey: ["payroll", selectedMonth] });
    },
    onError: () => {
      showToast("Failed to update payment status.", "error");
    },
  });

  // Mutation: Bulk Mark All Paid
  const markAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/payroll", {
        month: selectedMonth,
        markAll: true,
        paymentMethod: "Bank Transfer",
      });
      return res.data;
    },
    onSuccess: (data) => {
      showToast(data.message || "All staff marked as Paid!", "success");
      queryClient.invalidateQueries({ queryKey: ["payroll", selectedMonth] });
    },
    onError: () => {
      showToast("Failed to mark all staff as paid.", "error");
    },
  });

  const handlePrintPayslip = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2">
            <DollarSign className="text-emerald-600" size={32} /> Staff Payroll Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage monthly salaries, allowances, deductions, and issue payslips.
          </p>
        </div>

        {/* Month Selector & Bulk Action */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <RequirePermission permissions={[PERMISSIONS.staff.update]}>
            <button
              onClick={() => {
                if (confirm(`Mark all ${summary?.pendingStaffCount || 0} pending staff as PAID for ${selectedMonth}?`)) {
                  markAllMutation.mutate();
                }
              }}
              disabled={markAllMutation.isPending || !summary || summary.pendingStaffCount === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {markAllMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Mark All Paid ({summary?.pendingStaffCount || 0})</span>
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Monthly Payroll</p>
          <p className="text-2xl font-black text-gray-900 mt-1">
            Rs. {(summary?.totalMonthlyPayroll || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Basic: Rs. {(summary?.totalBasicSalary || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase">Paid Salaries</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            Rs. {(summary?.totalPaid || 0).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5 font-semibold">
            {summary?.paidStaffCount || 0} of {summary?.totalStaff || 0} Staff Paid
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase">Pending Salaries</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            Rs. {(summary?.totalPending || 0).toLocaleString()}
          </p>
          <p className="text-xs text-amber-700 mt-0.5 font-semibold">
            {summary?.pendingStaffCount || 0} Staff Awaiting Payment
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Staff</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {summary?.totalStaff || 0} Staff
          </p>
          <p className="text-xs text-purple-700 mt-0.5 font-semibold">Active Payroll Directory</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden space-y-4">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-base">Payroll Register</span>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
              {selectedMonth}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search staff by name/ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Loading / Empty States */}
        {isLoading || isFetching ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto text-emerald-600 mb-2" size={32} />
            <p className="font-medium text-sm">Loading payroll records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium">
            <Users className="mx-auto mb-2 text-gray-300" size={36} />
            <p>No staff payroll records found for {selectedMonth}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase">Employee ID</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase">Staff Member</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase">Role & Dept</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase text-right">Basic Salary</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase text-right">Allowances</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase text-right">Deductions</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase text-right">Net Salary</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase text-center">Status</th>
                  <th className="px-5 py-3 font-bold text-gray-500 text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRecords.map((rec: any) => {
                  const isPaid = rec.status === "Paid";
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-700 text-xs">
                        {rec.employeeId}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900">{rec.name}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-semibold text-gray-700">{rec.designation}</p>
                        <p className="text-[11px] text-gray-400">{rec.department}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                        Rs. {rec.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-600">
                        Rs. {rec.totalAllowances.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-600">
                        Rs. {rec.totalDeductions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-gray-900">
                        Rs. {rec.netSalary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActivePayslip(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 rounded-lg border border-gray-200 transition"
                            title="View / Print Payslip"
                          >
                            <FileText size={13} />
                            <span>Payslip</span>
                          </button>

                          <RequirePermission permissions={[PERMISSIONS.staff.update]}>
                            <button
                              onClick={() => {
                                markStatusMutation.mutate({
                                  staffId: rec.staffId,
                                  status: isPaid ? "Pending" : "Paid",
                                });
                              }}
                              disabled={markStatusMutation.isPending}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                                isPaid
                                  ? "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700 border border-gray-200"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {isPaid ? "Mark Pending" : "Mark Paid"}
                            </button>
                          </RequirePermission>
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

      {/* Payslip Modal View */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
            {/* Modal Actions Header (Hidden in Print) */}
            <div className="px-6 py-4 bg-gray-900 text-white flex justify-between items-center print:hidden">
              <span className="font-bold text-sm flex items-center gap-2">
                <FileText size={16} className="text-emerald-400" /> Salary Payslip Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPayslip}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <Printer size={14} /> Print Payslip
                </button>
                <button
                  onClick={() => setActivePayslip(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div ref={payslipRef} className="p-8 space-y-6 text-gray-900">
              {/* Organization Header */}
              <div className="text-center border-b pb-4 space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                  {schoolName}
                </h2>
                <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
                <p className="text-xs font-bold text-emerald-800 bg-emerald-50 inline-block px-3 py-1 rounded-full uppercase tracking-wider mt-2 border border-emerald-200">
                  Salary Payslip — {activePayslip.month}
                </p>
              </div>

              {/* Staff Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Staff Name</span>
                  <span className="font-bold text-gray-900 text-sm">{activePayslip.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Employee ID</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">{activePayslip.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Designation</span>
                  <span className="font-semibold text-gray-800">{activePayslip.designation}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase font-bold text-[10px]">Department</span>
                  <span className="font-semibold text-gray-800">{activePayslip.department}</span>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs uppercase text-gray-700">
                    Earnings
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary</span>
                      <span className="font-bold">Rs. {activePayslip.basicSalary.toLocaleString()}</span>
                    </div>
                    {activePayslip.allowances.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{a.title || "Allowance"}</span>
                        <span className="font-medium">Rs. {(Number(a.amount) || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-black text-gray-900">
                      <span>Total Earnings</span>
                      <span>Rs. {activePayslip.grossSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs uppercase text-gray-700">
                    Deductions
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    {activePayslip.deductions.length === 0 ? (
                      <p className="text-gray-400 italic">No deductions applicable</p>
                    ) : (
                      activePayslip.deductions.map((d: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-600">{d.title || "Deduction"}</span>
                          <span className="font-medium text-red-600">Rs. {(Number(d.amount) || 0).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                    <div className="border-t pt-2 flex justify-between font-black text-gray-900">
                      <span>Total Deductions</span>
                      <span className="text-red-600">Rs. {activePayslip.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-bold text-emerald-800">Net Payable Amount</span>
                  <p className="text-2xl font-black text-emerald-950">
                    Rs. {activePayslip.netSalary.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      activePayslip.status === "Paid"
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {activePayslip.status}
                  </span>
                  {activePayslip.paidAt && (
                    <p className="text-[10px] text-gray-500 mt-1">Paid on: {activePayslip.paidAt.slice(0, 10)}</p>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between text-xs text-gray-500">
                <div className="border-t border-gray-300 pt-2 w-40 text-center">
                  Accountant Signature
                </div>
                <div className="border-t border-gray-300 pt-2 w-40 text-center">
                  Principal Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
