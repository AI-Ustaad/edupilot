"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Wallet, Loader2, AlertCircle, CheckCircle,
  Save, DollarSign, Calendar, Users, Trash2, Sliders, Filter, Download, Printer, X,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useToast } from "@/components/ToastProvider";

// 🚀 Layered Architecture Hooks
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useFees, useSaveFee, useDeleteFee } from "@/hooks/useFees";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";
import { computeFeeSummary } from "@/lib/aggregations/shared-metrics";
import { compareLedgerRecords } from "@/lib/students/rollNumbers";

const MONTHS = [
  "January 2026", "February 2026", "March 2026", "April 2026",
  "May 2026", "June 2026", "July 2026", "August 2026",
  "September 2026", "October 2026", "November 2026", "December 2026",
];

function formatClassSection(cls?: string, sec?: string): string {
  let c = (cls || "").trim();
  let s = (sec || "").trim();
  if (c.toUpperCase().includes("SECTION")) {
    const parts = c.split(/-\s*SECTION/i);
    if (parts.length > 1) {
      c = parts[0].trim();
      if (!s) s = parts[1].trim();
    }
  }
  const finalClass = formatClassLabel(c);
  const cleanSec = cleanSectionName(s);
  return cleanSec ? `${finalClass} - Section ${cleanSec}` : finalClass;
}

export default function FeesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState("November 2026");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feeEntries, setFeeEntries] = useState<Record<string, { amount: string; status: string }>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [receiptModalFee, setReceiptModalFee] = useState<any | null>(null);

  // Natural deterministic student sorter: Class (1..10), Section (A, B, C), numeric Roll No
  const sortStudentsNaturally = (a: any, b: any) => {
    const classA = parseInt(String(a.classGrade || "").replace(/\D/g, ""), 10) || 0;
    const classB = parseInt(String(b.classGrade || "").replace(/\D/g, ""), 10) || 0;
    if (classA !== classB) return classA - classB;

    const secA = (a.section || "").trim().toUpperCase();
    const secB = (b.section || "").trim().toUpperCase();
    if (secA !== secB) return secA.localeCompare(secB);

    const rollA = parseInt(String(a.rollNumber || "").replace(/\D/g, ""), 10);
    const rollB = parseInt(String(b.rollNumber || "").replace(/\D/g, ""), 10);
    const validRollA = !isNaN(rollA);
    const validRollB = !isNaN(rollB);
    if (validRollA && validRollB) return rollA - rollB;
    if (validRollA && !validRollB) return -1;
    if (!validRollA && validRollB) return 1;
    return (a.fullName || a.name || "").localeCompare(b.fullName || b.name || "");
  };

  // 1. Fetch Live Classes
  const { data: classesData = [] } = useClasses();
  const availableClasses = useMemo(() => Array.from(new Set(classesData.map((c: any) => formatClassLabel(c.classGrade)).filter(Boolean))), [classesData]);
  const availableSections = useMemo(() => {
    if (!selectedClass) return [];
    return Array.from(new Set(
      classesData
        .filter((c: any) => formatClassLabel(c.classGrade) === formatClassLabel(selectedClass))
        .map((c: any) => cleanSectionName(c.sectionName || c.section))
        .filter(Boolean)
    ));
  }, [classesData, selectedClass]);

  // 2. Fetch Live Students
  const { data: students = [], isLoading: studentsLoading } = useStudents(
    selectedClass && selectedSection ? { classGrade: selectedClass, section: selectedSection } : undefined
  );

  // Student lookup map to resolve canonical names & roll numbers
  const studentLookup = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of students) {
      map.set(s.id, s);
    }
    return map;
  }, [students]);

  // 3. Fetch Fee Records
  const { data: feeRecords = [], isLoading: feesLoading } = useFees(selectedMonth, selectedClass, selectedSection);

  // 4. Mutations
  const saveMutation = useSaveFee();
  const deleteMutation = useDeleteFee();

  const filteredStudents = useMemo(() => {
    return students
      .filter((s: any) => {
        const matchClass = !selectedClass || formatClassLabel(s.classGrade) === formatClassLabel(selectedClass);
        const matchSection = !selectedSection || cleanSectionName(s.section) === cleanSectionName(selectedSection);
        if (!matchClass || !matchSection) return false;

        if (statusFilter !== "all") {
          const existing = feeRecords.find((f: any) =>
            f.studentId === s.id &&
            (f.feeMonth?.toLowerCase().includes(selectedMonth.toLowerCase().slice(0, 3)) || f.feeMonth === selectedMonth)
          );
          const st = (feeEntries[s.id]?.status ?? existing?.status ?? "pending").toLowerCase();
          if (st !== statusFilter) return false;
        }

        return true;
      })
      .sort(sortStudentsNaturally);
  }, [students, selectedClass, selectedSection, statusFilter, feeRecords, feeEntries, selectedMonth]);

  const filteredLedgerRecords = useMemo(() => {
    const records = feeRecords.filter((fee: any) => {
      if (selectedClass && formatClassLabel(fee.classGrade) !== formatClassLabel(selectedClass)) return false;
      if (selectedSection && cleanSectionName(fee.section) !== cleanSectionName(selectedSection)) return false;
      if (statusFilter !== "all") {
        const st = (fee.status || "pending").toLowerCase().trim();
        if (st !== statusFilter) return false;
      }
      return true;
    });

    // B29 — the Fee Ledger sorts strictly by roll number (same shared rule
    // as the API); records without a roll number go last, never interleaved.
    return records.sort((a: any, b: any) => {
      const stA = studentLookup.get(a.studentId);
      const stB = studentLookup.get(b.studentId);
      return compareLedgerRecords(
        {
          classGrade: stA?.classGrade || a.classGrade,
          section: stA?.section || a.section,
          rollNumber: stA?.rollNumber ?? a.rollNumber,
          fullName: a.studentName || stA?.fullName,
        },
        {
          classGrade: stB?.classGrade || b.classGrade,
          section: stB?.section || b.section,
          rollNumber: stB?.rollNumber ?? b.rollNumber,
          fullName: b.studentName || stB?.fullName,
        }
      );
    });
  }, [feeRecords, selectedClass, selectedSection, statusFilter, studentLookup]);

  const handleExportCSV = () => {
    const rows: string[] = [
      "Roll No,Student Name,Class,Section,Fee Month,Amount,Amount Paid,Status,Receipt Number,Date"
    ];

    const studentMap = new Map<string, any>();
    students.forEach((s: any) => studentMap.set(s.id, s));
    const processedStudentIds = new Set<string>();

    // B29 — export rows follow the same strict roll-number order as the
    // ledger table (API order is already sorted, this keeps the file
    // correct even if it ever regresses); roll-less records go last.
    [...feeRecords].sort(compareLedgerRecords).forEach((f: any) => {
      const student = studentMap.get(f.studentId);
      const roll = f.rollNumber || student?.rollNumber || "—";
      const name = (f.studentName || student?.fullName || student?.name || "Student").replace(/,/g, " ");
      const cls = formatClassLabel(f.classGrade || student?.classGrade || "");
      const sec = cleanSectionName(f.section || student?.section || "A");
      const month = f.feeMonth || selectedMonth;
      const amount = f.amount || 5000;
      const amountPaid = f.amountPaid ?? (f.status?.toLowerCase() === "paid" ? amount : 0);
      const status = (f.status || "pending").toUpperCase();
      const receipt = f.receiptNumber || "";
      const date = f.paidAt || f.createdAt || "";

      if (f.studentId) processedStudentIds.add(f.studentId);
      rows.push(`"${roll}","${name}","${cls}","${sec}","${month}",${amount},${amountPaid},"${status}","${receipt}","${date}"`);
    });

    const studentsWithoutRecords = students
      .filter((s: any) => !processedStudentIds.has(s.id))
      .sort(compareLedgerRecords);
    studentsWithoutRecords.forEach((s: any) => {
      const roll = s.rollNumber || "—";
      const name = (s.fullName || s.name || "Student").replace(/,/g, " ");
      const cls = formatClassLabel(s.classGrade || "");
      const sec = cleanSectionName(s.section || "A");
      const month = selectedMonth;
      const amount = s.monthlyFee ? Number(s.monthlyFee) : 5000;
      const amountPaid = 0;
      const status = "PENDING";
      const receipt = "";
      const date = "";
      rows.push(`"${roll}","${name}","${cls}","${sec}","${month}",${amount},${amountPaid},"${status}","${receipt}","${date}"`);
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fees-${selectedMonth.toLowerCase().replace(/\s+/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length - 1} fee records as CSV.`, "success");
  };

  const handleSaveSingle = async (student: any) => {
    const existing = feeRecords.find((f: any) => 
      f.studentId === student.id && 
      (f.feeMonth?.toLowerCase().includes(selectedMonth.toLowerCase().slice(0, 3)) || f.feeMonth === selectedMonth)
    );
    const isPaidExisting = (existing?.status || "").toLowerCase() === "paid";
    const defaultAmount = isPaidExisting
      ? (existing?.amountPaid || 5000).toString()
      : (existing?.amountDue || existing?.amount || 5000).toString();
    const currentAmount = feeEntries[student.id]?.amount ?? defaultAmount;
    const currentStatus = feeEntries[student.id]?.status ?? existing?.status ?? (isPaidExisting ? "paid" : "pending");
    const isPaid = currentStatus.toLowerCase() === "paid";
    const amt = Number(currentAmount) || 5000;

    setSaving(true);
    try {
      await saveMutation.mutateAsync({
        studentId: student.id,
        studentName: student.fullName || student.name,
        rollNumber: student.rollNumber,
        classGrade: student.classGrade,
        section: student.section,
        feeMonth: selectedMonth,
        amount: amt,
        amountPaid: isPaid ? amt : (amt || 5000),
        status: currentStatus,
      });
      showToast(`Fee record saved for ${student.fullName || student.name}!`, "success");
      setSuccess(`Fee record saved for ${student.fullName || student.name}!`);
      setTimeout(() => setSuccess(""), 4000);
      setFeeEntries((prev) => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });
    } catch {
      showToast("Failed to save fee record.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    const studentsToSave = filteredStudents.filter((student: any) => {
      const entry = feeEntries[student.id];
      return entry && Number(entry.amount) > 0;
    });

    if (studentsToSave.length === 0) {
      showToast("Please adjust fee amounts or status for students before saving.", "error");
      return;
    }

    setSaving(true);
    try {
      await Promise.all(studentsToSave.map((student: any) => {
        const entry = feeEntries[student.id];
        const isPaid = (entry.status || "paid").toLowerCase() === "paid";
        const amt = Number(entry.amount) || 5000;
        return saveMutation.mutateAsync({
          studentId: student.id,
          studentName: student.fullName || student.name,
          rollNumber: student.rollNumber,
          classGrade: student.classGrade,
          section: student.section,
          feeMonth: selectedMonth,
          amount: amt,
          amountPaid: isPaid ? amt : (amt || 5000),
          status: entry.status || (isPaid ? "paid" : "pending"),
        });
      }));
      showToast(`Saved ${studentsToSave.length} fee records successfully!`, "success");
      setSuccess(`Saved ${studentsToSave.length} fee records successfully!`);
      setTimeout(() => setSuccess(""), 4000);
      setFeeEntries({});
    } catch {
      showToast("Failed to save fees.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to archive this fee record?")) {
      deleteMutation.mutate(id);
    }
  };

  // 🛡️ Accounting-Invariant Aggregation Logic (Zero-Preserving & Null-Aware via Single-Source computeFeeSummary)
  const activeRecords = useMemo(() => {
    if (feeRecords.length > 0) return feeRecords;
    return filteredStudents.map((s: any) => ({
      studentId: s.id,
      studentName: s.fullName || s.name,
      classGrade: s.classGrade,
      section: s.section,
      amount: 5000,
      amountPaid: 0,
      amountDue: 5000,
      status: "pending",
    }));
  }, [feeRecords, filteredStudents]);

  const feeSummary = useMemo(() => computeFeeSummary(activeRecords), [activeRecords]);

  const isSummaryLoading = feesLoading || (Boolean(selectedClass && selectedSection) && studentsLoading);

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Wallet className="text-green-600" /> Fee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage student fee collections securely.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
            title="Export fee records as CSV"
          >
            <Download size={18} /> Export CSV
          </button>
          <Link
            href="/fees/structure"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
          >
            <Sliders size={18} /> Fee Structure
          </Link>
          <RequirePermission permissions={[PERMISSIONS.fees.create]}>
            <button
              onClick={handleSaveAll}
              disabled={saving || saveMutation.isPending || filteredStudents.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition"
            >
              {saving || saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save All Fees
            </button>
          </RequirePermission>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 font-bold border border-green-100">
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* 🎨 Summary Cards with Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Collected</p>
              {isSummaryLoading ? (
                <div className="flex items-center gap-2 mt-2 h-9">
                  <Loader2 className="animate-spin text-white/80" size={22} />
                  <span className="text-xl font-bold animate-pulse text-white/90">Loading...</span>
                </div>
              ) : (
                <p className="text-3xl font-black mt-2">Rs. {feeSummary.totalCollected.toLocaleString()}</p>
              )}
            </div>
            <CheckCircle size={40} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Pending</p>
              {isSummaryLoading ? (
                <div className="flex items-center gap-2 mt-2 h-9">
                  <Loader2 className="animate-spin text-white/80" size={22} />
                  <span className="text-xl font-bold animate-pulse text-white/90">Loading...</span>
                </div>
              ) : (
                <p className="text-3xl font-black mt-2">Rs. {feeSummary.totalPending.toLocaleString()}</p>
              )}
            </div>
            <AlertCircle size={40} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Records</p>
              {isSummaryLoading ? (
                <div className="flex items-center gap-2 mt-2 h-9">
                  <Loader2 className="animate-spin text-white/80" size={22} />
                  <span className="text-xl font-bold animate-pulse text-white/90">Loading...</span>
                </div>
              ) : (
                <p className="text-3xl font-black mt-2">{feeSummary.totalRecords}</p>
              )}
            </div>
            <Users size={40} className="opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Billing Month</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium">
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Class</label>
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium">
            <option value="">All Classes</option>
            {availableClasses.map((c: string) => <option key={c} value={c}>{formatClassLabel(c)}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Section</label>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium disabled:bg-gray-100">
            <option value="">All Sections</option>
            {availableSections.map((s) => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status Filter</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium">
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign size={18} /> Fee Entry — {selectedMonth} ({filteredStudents.length} Students)
          </span>
        </div>
        {studentsLoading || feesLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-green-500" size={32} /></div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-bold">No students found for selected filters.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student: any) => {
              const existing = feeRecords.find((f: any) => 
                f.studentId === student.id && 
                (f.feeMonth?.toLowerCase().includes(selectedMonth.toLowerCase().slice(0, 3)) || f.feeMonth === selectedMonth)
              );
              const isPaid = (existing?.status || "").toLowerCase() === "paid";
              const defaultAmount = isPaid ? (existing?.amountPaid || 5000).toString() : (existing?.amountDue || existing?.amount || 5000).toString();
              const currentAmount = feeEntries[student.id]?.amount ?? defaultAmount;
              const currentStatus = feeEntries[student.id]?.status ?? existing?.status ?? (isPaid ? "paid" : "pending");
              return (
                <div key={student.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">
                      {student.rollNumber || "—"}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 flex items-center">
                        {student.fullName || student.name}
                        {((student.fullName || student.name) === "Test Student Alpha" || student.isTestData) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 ml-1.5 border border-amber-200">TEST</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">{formatClassSection(student.classGrade, student.section)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={currentAmount}
                      onChange={(e) => setFeeEntries((prev) => ({
                        ...prev,
                        [student.id]: { amount: e.target.value, status: prev[student.id]?.status ?? currentStatus }
                      }))}
                      className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-center font-bold"
                    />
                    <select
                      value={currentStatus}
                      onChange={(e) => setFeeEntries((prev) => ({
                        ...prev,
                        [student.id]: { amount: prev[student.id]?.amount ?? currentAmount, status: e.target.value }
                      }))}
                      className={`border rounded-lg px-3 py-2 font-bold ${
                        currentStatus === "paid"
                          ? "bg-green-100 border-green-300 text-green-700"
                          : currentStatus === "partial"
                          ? "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-orange-100 border-orange-300 text-orange-700"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSaveSingle(student)}
                      disabled={saving || saveMutation.isPending}
                      className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                      title="Save this student's fee"
                    >
                      <Save size={14} /> Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filteredLedgerRecords.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar size={18} /> Fee Ledger — {selectedMonth} ({filteredLedgerRecords.length} Records)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-600">Student</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Class & Section</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Amount</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Status</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Receipt Ref</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLedgerRecords.map((fee: any) => {
                  const resolvedStudent = studentLookup.get(fee.studentId);
                  const studentName = resolvedStudent?.fullName || resolvedStudent?.name || fee.studentName || "Student";
                  const studentClass = formatClassLabel(resolvedStudent?.classGrade || fee.classGrade);
                  const studentSection = cleanSectionName(resolvedStudent?.section || fee.section);
                  const rollNumber = resolvedStudent?.rollNumber ?? fee.rollNumber ?? "—";

                  const isPaid = (fee.status || "").toLowerCase() === "paid";
                  const displayAmount = isPaid ? (fee.amountPaid || fee.amount || 5000) : (fee.amountDue || fee.amount || 5000);

                  return (
                    <tr key={fee.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3">
                        <div className="font-bold text-gray-900 flex items-center">
                          {studentName}
                          {(studentName === "Test Student Alpha" || resolvedStudent?.isTestData) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 ml-1.5 border border-amber-200">TEST</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">Roll #{rollNumber}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-600 font-medium">{formatClassSection(studentClass, studentSection)}</td>
                      <td className="px-6 py-3 font-black text-gray-900">Rs. {Number(displayAmount).toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isPaid
                            ? "bg-green-100 text-green-700 border-green-300"
                            : fee.status?.toLowerCase() === "partial"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-orange-100 text-orange-700 border-orange-200"
                        }`}>
                          {fee.status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {fee.receiptNumber ? (
                          <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                            {fee.receiptNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid && (
                            <button
                              onClick={() => setReceiptModalFee({
                                fee,
                                studentName,
                                studentClass,
                                studentSection,
                                rollNumber,
                                displayAmount,
                                receiptNumber: fee.receiptNumber || "RCP-202611-UWW1LV",
                                date: fee.paidAt || fee.createdAt || "2026-11-20",
                              })}
                              className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold"
                              title="View & Print Official Receipt"
                            >
                              <Printer size={14} /> Receipt
                            </button>
                          )}
                          <RequirePermission permissions={[PERMISSIONS.fees.manage]}>
                            <button
                              onClick={() => handleDelete(fee.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                              title="Archive fee record"
                            >
                              {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
        </div>
      )}

      {/* Official Printable Fee Receipt Modal */}
      {receiptModalFee && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in border border-gray-200">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Government High School Sahiwal</h3>
                <p className="text-xs text-gray-500 font-medium">Official Student Fee Payment Receipt</p>
              </div>
              <button
                onClick={() => setReceiptModalFee(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Receipt No</span>
                <span className="font-mono font-black text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {receiptModalFee.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Payment Date</span>
                <span className="font-bold text-gray-800">
                  {new Date(receiptModalFee.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Billing Month</span>
                <span className="font-bold text-gray-800">{receiptModalFee.fee?.feeMonth || selectedMonth}</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-sm">
              <div className="p-3 flex justify-between">
                <span className="text-gray-500 font-medium">Student Name:</span>
                <span className="font-bold text-gray-900">{receiptModalFee.studentName}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500 font-medium">Class & Section:</span>
                <span className="font-bold text-gray-900">{formatClassSection(receiptModalFee.studentClass, receiptModalFee.studentSection)}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-500 font-medium">Roll Number:</span>
                <span className="font-bold text-gray-900">#{receiptModalFee.rollNumber}</span>
              </div>
              <div className="p-3 flex justify-between items-center bg-green-50/50">
                <span className="text-green-800 font-bold">Amount Paid:</span>
                <span className="text-lg font-black text-green-700">Rs. {Number(receiptModalFee.displayAmount).toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                  PAID IN FULL
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReceiptModalFee(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition text-sm shadow-sm"
              >
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
