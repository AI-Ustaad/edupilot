"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Wallet, Loader2, AlertCircle, CheckCircle,
  Save, DollarSign, Calendar, Users, Trash2,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🚀 Layered Architecture Hooks
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { useFees, useSaveFee, useDeleteFee } from "@/hooks/useFees";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function FeesPage() {
  const { user } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [feeEntries, setFeeEntries] = useState<Record<string, { amount: string; status: string }>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // 1. Fetch Live Classes
  const { data: classesData = [] } = useClasses();
  const availableClasses = useMemo(() => Array.from(new Set(classesData.map((c: any) => c.classGrade))), [classesData]);
  const availableSections = useMemo(() => classesData.filter((c: any) => c.classGrade === selectedClass).map((c: any) => c.sectionName || c.section), [classesData, selectedClass]);

  // 2. Fetch Live Students
  const { data: students = [], isLoading: studentsLoading } = useStudents(
    selectedClass && selectedSection ? { classGrade: selectedClass, section: selectedSection } : undefined
  );

  // 3. Fetch Fee Records
  const { data: feeRecords = [], isLoading: feesLoading } = useFees(selectedMonth, selectedClass, selectedSection);

  // 4. Mutations
  const saveMutation = useSaveFee();
  const deleteMutation = useDeleteFee();

  const filteredStudents = students.filter(
    (s: any) => (!selectedClass || s.classGrade === selectedClass) && (!selectedSection || s.section === selectedSection)
  );

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(filteredStudents.map((student: any) => {
        const entry = feeEntries[student.id] || { amount: "0", status: "pending" };
        return saveMutation.mutateAsync({
          studentId: student.id,
          studentName: student.fullName || student.name,
          classGrade: student.classGrade,
          section: student.section,
          feeMonth: selectedMonth,
          amountPaid: Number(entry.amount),
          status: entry.status,
        });
      }));
      setSuccess("Fee records saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed to save fees.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to archive this fee record?")) {
      deleteMutation.mutate(id);
    }
  };

  // 🛡️ Case-Insensitive Math Logic
  const totalCollected = feeRecords.filter((f: any) => f.status?.toLowerCase() === "paid").reduce((sum: number, f: any) => sum + (f.amountPaid || 0), 0);
  const totalPending = feeRecords.filter((f: any) => f.status?.toLowerCase() === "pending" || f.status?.toLowerCase() === "partial").reduce((sum: number, f: any) => sum + (f.amountPaid || 0), 0);

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Wallet className="text-green-600" /> Fee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage student fee collections securely.</p>
        </div>
        <RequirePermission permissions={[PERMISSIONS.fees.create]}>
          <button onClick={handleSaveAll} disabled={saving || saveMutation.isPending || filteredStudents.length === 0} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md disabled:opacity-50">
            {saving || saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save All Fees
          </button>
        </RequirePermission>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 font-bold border border-green-100"><CheckCircle size={18} /> {success}</div>}

      {/* 🎨 Summary Cards with Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium opacity-90">Total Collected</p><p className="text-3xl font-black mt-2">Rs. {totalCollected.toLocaleString()}</p></div>
            <CheckCircle size={40} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium opacity-90">Total Pending</p><p className="text-3xl font-black mt-2">Rs. {totalPending.toLocaleString()}</p></div>
            <AlertCircle size={40} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium opacity-90">Total Records</p><p className="text-3xl font-black mt-2">{feeRecords.length}</p></div>
            <Users size={40} className="opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Month</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium">
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Class</label>
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(""); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium">
            <option value="">All Classes</option>
            {availableClasses.map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Section</label>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass} className="w-full border border-gray-300 rounded-lg px-3 py-2 font-medium disabled:bg-gray-100">
            <option value="">All Sections</option>
            {availableSections.map((s) => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
          <DollarSign size={18} /> Fee Entry - {selectedMonth}
        </div>
        {studentsLoading || feesLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-green-500" size={32} /></div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-bold">No students found for selected filters.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredStudents.map((student: any) => {
              const existing = feeRecords.find((f: any) => f.studentId === student.id && f.feeMonth === selectedMonth);
              const currentAmount = feeEntries[student.id]?.amount ?? existing?.amountPaid?.toString() ?? "0";
              const currentStatus = feeEntries[student.id]?.status ?? existing?.status ?? "pending";
              return (
                <div key={student.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">{student.rollNumber || "—"}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{student.fullName || student.name}</p>
                      <p className="text-xs text-gray-400 uppercase">Class {student.classGrade} - Section {student.section}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Amount" value={currentAmount} onChange={(e) => setFeeEntries((prev) => ({ ...prev, [student.id]: { amount: e.target.value, status: prev[student.id]?.status ?? currentStatus } }))} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center font-bold" />
                    <select value={currentStatus} onChange={(e) => setFeeEntries((prev) => ({ ...prev, [student.id]: { amount: prev[student.id]?.amount ?? currentAmount, status: e.target.value } }))} className={`border rounded-lg px-3 py-2 font-bold ${currentStatus === "paid" ? "bg-green-100 border-green-300 text-green-700" : "bg-orange-100 border-orange-300 text-orange-700"}`}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {feeRecords.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
            <Calendar size={18} /> Fee Ledger - {selectedMonth}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-gray-600">Student</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Class</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Amount</th>
                  <th className="px-6 py-3 font-bold text-gray-600">Status</th>
                  <th className="px-6 py-3 font-bold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feeRecords.map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-bold text-gray-900">{fee.studentName}</td>
                    <td className="px-6 py-3 text-gray-600">{fee.classGrade} - {fee.section}</td>
                    <td className="px-6 py-3 font-black text-gray-900">Rs. {fee.amountPaid?.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${fee.status?.toLowerCase() === "paid" ? "bg-green-100 text-green-700" : fee.status?.toLowerCase() === "partial" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {fee.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <RequirePermission permissions={[PERMISSIONS.fees.manage]}>
                        <button onClick={() => handleDelete(fee.id)} disabled={deleteMutation.isPending} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition disabled:opacity-50">
                          {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </RequirePermission>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
