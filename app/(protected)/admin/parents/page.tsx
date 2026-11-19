"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Loader2, 
  UserPlus, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Heart, 
  ShieldCheck, 
  GraduationCap, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Filter 
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStudents } from "@/hooks/useStudents";
import { useParents, useCreateParent } from "@/hooks/useParents";
import { TableSkeleton } from "@/components/ui/skeleton/TableSkeleton";

export default function ManageParents() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: parentsList = [], isLoading: parentsLoading } = useParents();
  const createParentMutation = useCreateParent();

  const [search, setSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", studentIds: [] as string[] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createParentMutation.mutate(form, {
      onSuccess: () => {
        setForm({ fullName: "", email: "", password: "", phone: "", studentIds: [] });
        setIsFormOpen(false);
      },
    });
  };

  const toggleStudent = (id: string) => {
    setForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id) ? prev.studentIds.filter(s => s !== id) : [...prev.studentIds, id]
    }));
  };

  // Filter parents and guardians
  const filteredParents = parentsList.filter((p: any) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q ||
      p.fullName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.students?.some((s: any) => 
        s.name?.toLowerCase().includes(q) || 
        s.classGrade?.toLowerCase().includes(q) ||
        s.section?.toLowerCase().includes(q)
      );

    const matchesType = accountTypeFilter === "all" || 
      (accountTypeFilter === "portal" && p.accountType === "Registered Portal User") ||
      (accountTypeFilter === "guardian" && p.accountType === "Student Guardian Record");

    return matchesSearch && matchesType;
  });

  const portalAccountsCount = parentsList.filter((p: any) => p.accountType === "Registered Portal User").length;
  const guardianRecordsCount = parentsList.length - portalAccountsCount;

  return (
    <RequirePermission permissions={[PERMISSIONS.parents.view]}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
              <Heart className="text-rose-500" size={28} /> Parents & Guardians Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse guardian records and manage parent portal login credentials.
            </p>
          </div>
          
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm text-sm"
          >
            <UserPlus size={16} />
            {isFormOpen ? "Close Form" : "Add Parent Portal Account"}
            {isFormOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Contacts</p>
              <p className="text-xl font-black text-gray-900">{parentsList.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Portal Accounts</p>
              <p className="text-xl font-black text-green-600">{portalAccountsCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Student Guardians</p>
              <p className="text-xl font-black text-purple-600">{guardianRecordsCount}</p>
            </div>
          </div>
        </div>

        {/* Expandable Add Parent Account Form */}
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }}
            className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-md space-y-5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" /> Create Parent Login Account
              </h2>
              <span className="text-xs text-blue-600 bg-blue-50 font-bold px-2.5 py-1 rounded-full">
                Portal Access
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input 
                    placeholder="e.g. Muhammad Aslam" 
                    value={form.fullName} 
                    onChange={e => setForm({...form, fullName: e.target.value})} 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Login Email *</label>
                  <input 
                    type="email" 
                    placeholder="parent@example.com" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Password *</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})} 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input 
                    placeholder="+92 300 1234567" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm outline-none" 
                  />
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
                <label className="font-bold text-gray-800 text-sm mb-1 block">Link Enrolled Students</label>
                <p className="text-xs text-gray-500 mb-2">Select one or more students whose reports and fees this parent can view.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-white p-3 border border-gray-200 rounded-lg">
                  {studentsLoading ? (
                    <p className="text-gray-400 text-sm italic p-2 col-span-3 text-center">
                      <Loader2 className="animate-spin inline mr-2" size={14} /> Loading students...
                    </p>
                  ) : students.length === 0 ? (
                    <p className="text-gray-400 text-sm italic p-2 col-span-3">No students found.</p>
                  ) : (
                    students.map((s: any) => (
                      <label key={s.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer text-xs">
                        <input 
                          type="checkbox" 
                          checked={form.studentIds.includes(s.id)} 
                          onChange={() => toggleStudent(s.id)} 
                          className="w-3.5 h-3.5 text-blue-600 rounded" 
                        />
                        <span className="text-gray-800 font-medium truncate">
                          {s.fullName || s.name}
                          <span className="text-[10px] text-gray-400 ml-1">({s.classGrade})</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createParentMutation.isPending} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition disabled:opacity-50 text-sm shadow-sm"
                >
                  {createParentMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Parent Name, Phone, Email, or Child Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 transition text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2.5 font-medium bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="all">All Contacts</option>
              <option value="portal">Registered Portal Users</option>
              <option value="guardian">Student Guardian Records</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users size={18} /> Directory Roster
            </span>
            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border">
              {filteredParents.length} Contacts
            </span>
          </div>

          {parentsLoading ? (
            <div className="p-6"><TableSkeleton rows={8} cols={4} /></div>
          ) : filteredParents.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">
              No parents or guardians found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="p-4 font-bold">Guardian / Parent Name</th>
                    <th className="p-4 font-bold">Contact Details</th>
                    <th className="p-4 font-bold">Linked Children</th>
                    <th className="p-4 font-bold">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredParents.map((parent: any) => (
                    <tr key={parent.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm">
                          {parent.fullName}
                        </div>
                      </td>
                      <td className="p-4 text-xs space-y-1">
                        {parent.phone && parent.phone !== "—" && (
                          <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                            <Phone size={13} className="text-gray-400" />
                            {parent.phone}
                          </div>
                        )}
                        {parent.email && parent.email !== "—" && (
                          <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px]">
                            <Mail size={13} className="text-gray-400" />
                            {parent.email}
                          </div>
                        )}
                        {(!parent.phone || parent.phone === "—") && (!parent.email || parent.email === "—") && (
                          <span className="text-gray-400 italic">No contact details</span>
                        )}
                      </td>
                      <td className="p-4">
                        {parent.students && parent.students.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {parent.students.map((st: any) => (
                              <span 
                                key={st.id} 
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium"
                              >
                                <GraduationCap size={12} />
                                {st.name}
                                {st.classGrade && (
                                  <span className="text-[10px] bg-blue-200 text-blue-800 px-1 rounded ml-0.5 font-bold">
                                    {st.classGrade}{st.section ? `-${st.section}` : ""}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No linked students</span>
                        )}
                      </td>
                      <td className="p-4">
                        {parent.accountType === "Registered Portal User" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={13} /> Portal Account
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                            Student Guardian Record
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
