"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, Loader2, AlertCircle, CheckCircle, Save, Trash2 } from "lucide-react";
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

export default function FeesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [feeEntries, setFeeEntries] = useState<Record<string, { amount: string; status: string }>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { data: feeRecords = [], isLoading } = useQuery({
    queryKey: ["fees", user?.tenantId, selectedMonth],
    queryFn: () => fetchFees({ month: selectedMonth }),
    enabled: !!user?.tenantId,
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
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) deleteMutation.mutate(id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">Fee Management</h1>
        
        {/* 🛡️ Protected Save Button */}
        <RequirePermission permissions={[PERMISSIONS.fees.manage]}>
          <button 
            onClick={() => {}} 
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
          >
            <Save size={18}/> Save All
          </button>
        </RequirePermission>
      </div>

      {/* Ledger Table - With Loop for 'fee' object */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y">
            {feeRecords.map((fee: any) => (
              <tr key={fee.id}>
                <td className="px-6 py-4 font-bold">{fee.studentName}</td>
                <td className="px-6 py-4 text-right">
                  {/* 🛡️ Protected Delete Button - Now 'fee' is defined! */}
                  <RequirePermission permissions={[PERMISSIONS.fees.manage]}>
                    <button 
                      onClick={() => handleDelete(fee.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </RequirePermission>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
