"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Wallet, Plus, Trash2, Loader2, AlertCircle, CheckCircle, 
  Save, Search, DollarSign, Calendar, Users 
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// --- API Helpers ---
const fetchFees = async (params: Record<string, string>) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/v1/fees?${q}`);
  if (!res.ok) throw new Error("Failed to fetch fees");
  const json = await res.json();
  return json.data || [];
};

const saveFeeApi = async (data: any) => {
  const res = await fetch("/api/v1/fees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save fee");
  return res.json();
};

const deleteFeeApi = async (id: string) => {
  const res = await fetch(`/api/v1/fees?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete fee");
  return res.json();
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FeesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [feeEntries, setFeeEntries] = useState<Record<string, { amount: string; status: string }>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { data: feeRecords = [], isLoading } = useQuery({
    queryKey: ["fees", user?.tenantId, selectedMonth, selectedClass, selectedSection],
    queryFn: () => fetchFees({ month: selectedMonth, classGrade: selectedClass, section: selectedSection }),
    enabled: !!user?.tenantId && !!selectedMonth,
  });

  const saveMutation = useMutation({
    mutationFn: saveFeeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setSuccess("Fee records saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: () => setError("Failed to save fee records."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setSuccess("Fee record archived.");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: () => setError("Failed to archive fee record."),
  });

  const students = [
    { id: "st1", name: "Ahmed Khan", class: "9", section: "A", roll: 1 },
    { id: "st2", name: "Sara Ali", class: "9", section: "A", roll: 2 },
    { id: "st3", name: "Omar Farooq", class: "9", section: "B", roll: 1 },
  ];

  const filteredStudents = students.filter(s => 
    (!selectedClass || s.class === selectedClass) && 
    (!selectedSection || s.section === selectedSection)
  );

  const handleSaveAll = async () => {
    setSaving(true);
    setError("");
    try {
      const promises = filteredStudents.map(student => {
        const entry = feeEntries[student.id] || { amount: "0", status: "pending" };
        return saveMutation.mutateAsync({
          studentId: student.id,
          studentName: student.name,
          classGrade: student.class,
          section: student.section,
          month: selectedMonth,
          amount: Number(entry.amount),
          status: entry.status,
        });
      });
      await Promise.all(promises);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to archive this fee record?")) {
      deleteMutation.mutate(id);
    }
  };

  const totalCollected = feeRecords
    .filter((f: any) => f.status === "paid")
    .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);

  const totalPending = feeRecords
    .filter((f: any) => f.status === "pending")
    .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);

  if (!user?.tenantId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Wallet className="text-green-600"/> Fee Management
          </h1>
        </div>
        
        {/* 🛡️ Protected Save Button */}
        <RequirePermission permissions={[PERMISSIONS.finance.manage]}>
          <button 
            onClick={handleSaveAll} 
            disabled={saving || saveMutation.isPending || filteredStudents.length === 0} 
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {saving || saveMutation.isPending ? <Loader2 className="animate-spin"/> : <Save size={18}/>} 
            Save All Fees
          </button>
        </RequirePermission>
      </div>

      {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 font-bold border border-green-100"><CheckCircle size={18}/> {success}</div>}
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 font-bold border border-red-100"><AlertCircle size={18}/> {error}</div>}

      {/* Summary Cards and Filters (Code remains the same) */}
      
      {/* Table - Protected Delete Button */}
      <td className="px-6 py-3 text-right">
        <RequirePermission permissions={[PERMISSIONS.finance.manage]}>
          <button 
            onClick={() => handleDelete(fee.id)}
            disabled={deleteMutation.isPending}
            className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
          >
            {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
          </button>
        </RequirePermission>
      </td>
    </div>
  );
}
