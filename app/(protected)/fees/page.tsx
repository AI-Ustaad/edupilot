"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Wallet, Search, Save, CheckCircle2, AlertCircle, 
  Users, Loader2, Trash2, Plus, Calendar, DollarSign,
  TrendingUp, TrendingDown, Receipt
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// --- API Helpers ---
const fetchFees = async (params: Record<string, string>) => {
  const q = new URLSearchParams(params);
  const res = await fetch(`/api/fees?${q}`);
  if (!res.ok) throw new Error("Failed to fetch fees");
  const json = await res.json();
  return json.data || [];
};

const saveFeeApi = async (data: any) => {
  const res = await fetch("/api/fees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save fee");
  return res.json();
};

const deleteFeeApi = async (id: string) => {
  const res = await fetch(`/api/fees?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete fee");
  return res.json();
};

export default function FeesManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({
    studentId: "", studentName: "", classGrade: "", section: "",
    month: selectedMonth, amount: "", discount: "0", status: "pending",
    paymentMethod: "Cash", notes: ""
  });

  // 🚀 Fetch Fees via React Query
  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["fees", user?.tenantId, selectedMonth, selectedClass, selectedSection],
    queryFn: () => fetchFees({ 
      month: selectedMonth,
      classGrade: selectedClass,
      section: selectedSection,
    }),
    enabled: !!user?.tenantId,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: saveFeeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      setShowForm(false);
      setFormData({
        studentId: "", studentName: "", classGrade: "", section: "",
        month: selectedMonth, amount: "", discount: "0", status: "pending",
        paymentMethod: "Cash", notes: ""
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });

  // Filter fees by search
  const filteredFees = fees.filter((f: any) => {
    const matchSearch = !searchQuery || 
      f.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.studentId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Analytics
  const totalCollected = fees.filter((f: any) => f.status === "paid").reduce((sum: number, f: any) => sum + (f.netAmount || 0), 0);
  const totalPending = fees.filter((f: any) => f.status === "pending").reduce((sum: number, f: any) => sum + (f.netAmount || 0), 0);
  const totalDiscount = fees.reduce((sum: number, f: any) => sum + (f.discount || 0), 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) {
      alert("Student ID and amount are required");
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure? This will archive the fee record.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Wallet className="text-green-600"/> Fee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage student fee collection securely.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md"
        >
          <Plus size={18}/> Add Fee Record
        </button>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Collected</p>
              <p className="text-2xl font-black text-green-600 mt-1">Rs. {totalCollected.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24}/>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Pending</p>
              <p className="text-2xl font-black text-orange-600 mt-1">Rs. {totalPending.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-orange-600" size={24}/>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Discounts Given</p>
              <p className="text-2xl font-black text-blue-600 mt-1">Rs. {totalDiscount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Receipt className="text-blue-600" size={24}/>
            </div>
          </div>
        </div>
      </div>

      {/* ADD FEE FORM */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-green-500"/> New Fee Record
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" placeholder="Student ID" required
              value={formData.studentId}
              onChange={e => setFormData({...formData, studentId: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            />
            <input 
              type="text" placeholder="Student Name" required
              value={formData.studentName}
              onChange={e => setFormData({...formData, studentName: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            />
            <select 
              value={formData.month}
              onChange={e => setFormData({...formData, month: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input 
              type="number" placeholder="Amount (Rs.)" required
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            />
            <input 
              type="number" placeholder="Discount (Rs.)"
              value={formData.discount}
              onChange={e => setFormData({...formData, discount: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            />
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="waived">Waived</option>
            </select>
            <input 
              type="text" placeholder="Class"
              value={formData.classGrade}
              onChange={e => setFormData({...formData, classGrade: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            />
            <input 
              type="text" placeholder="Section"
              value={formData.section}
              onChange={e => setFormData({...formData, section: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            />
            <select 
              value={formData.paymentMethod}
              onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-3 font-medium"
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>Online</option>
            </select>
            <div className="md:col-span-3 flex gap-3">
              <button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin"/> : <Save size={18}/>} 
                Save Record
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 font-medium">
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input 
          type="text" placeholder="Search student..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 font-medium flex-1 min-w-[200px]"
        />
      </div>

      {/* FEES TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
          <Receipt size={18}/> Fee Records ({filteredFees.length})
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-green-500" size={32}/></div>
        ) : filteredFees.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold">No fee records found for this month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-bold">Student</th>
                  <th className="px-6 py-3 font-bold">Class</th>
                  <th className="px-6 py-3 font-bold">Month</th>
                  <th className="px-6 py-3 font-bold text-right">Amount</th>
                  <th className="px-6 py-3 font-bold text-right">Discount</th>
                  <th className="px-6 py-3 font-bold text-right">Net</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFees.map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{fee.studentName || "Unknown"}</p>
                      <p className="text-xs text-gray-400">ID: {fee.studentId}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{fee.classGrade} - {fee.section}</td>
                    <td className="px-6 py-4 font-medium text-gray-600">{fee.month}</td>
                    <td className="px-6 py-4 text-right font-bold">Rs. {(fee.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-blue-600 font-bold">Rs. {(fee.discount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-gray-900">Rs. {(fee.netAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                        fee.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        fee.status === 'partial' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {fee.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(fee.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
