"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, Loader2, AlertCircle, CheckCircle, Save, DollarSign, Calendar, Users } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// ... (API Helpers and setup remain same) ...

export default function FeesPage() {
  // ... (existing state and logic) ...

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div><h1 className="text-2xl font-black text-gray-900">Fee Management</h1></div>
        
        {/* 🛡️ Protected Save Button */}
        <RequirePermission permissions={[PERMISSIONS.finance.manage]}>
          <button onClick={handleSaveAll} disabled={saving || saveMutation.isPending} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin"/> : <Save size={18}/>} Save All Fees
          </button>
        </RequirePermission>
      </div>

      {/* ... (Summary Cards and Filters) ... */}

      {/* Fees List */}
      <div className="divide-y divide-gray-100">
        {filteredStudents.map(student => (
           <div key={student.id} className="...">
             {/* ... */}
           </div>
        ))}
      </div>

      {/* Ledger Table - Delete Button Protected */}
      <button onClick={() => handleDelete(fee.id)} className="...">
        <RequirePermission permissions={[PERMISSIONS.finance.manage]}>
          <Trash2 size={16}/>
        </RequirePermission>
      </button>
    </div>
  );
}
