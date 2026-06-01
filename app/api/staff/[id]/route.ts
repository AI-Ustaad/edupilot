"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowLeft, Printer, Users, Mail, Phone, ShieldCheck, MapPin, Calendar } from "lucide-react";

interface StaffData {
  id: string;
  personal?: {
    fullName?: string;
    cnic?: string;
    email?: string;
    phone?: string;
    currentAddress?: string;
    photo?: string;
  };
  professional?: {
    designation?: string;
    bps?: string;
    personnelNo?: string;
    empCategory?: string;
    doj?: string;
  };
  financial?: {
    bankName?: string;
    accountNo?: string;
  };
  education?: any[];
  allowances?: { name: string; amount: number }[];
  deductions?: { name: string; amount: number }[];
  netPayDetails?: { netPay?: number };
}

function StaffProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const staffId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffData | null>(null);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (!staffId) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/staff/${staffId}`);
        if (res.ok) {
          const json = await res.json();
          setStaff(json.data || json);
        }
      } catch (error) {
        console.error("Failed to fetch staff profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [staffId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-gray-700">Profile Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const { personal, professional, financial, allowances, deductions, netPayDetails } = staff;

  const TABS = [
    { id: "personal", label: "Basic Info" },
    { id: "professional", label: "Professional" },
    { id: "financial", label: "Financial" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Back & Print */}
      <div className="flex justify-between print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 font-bold bg-white px-4 py-2 rounded-xl shadow">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Printer size={18} /> Print
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-green-500" />
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-4">
            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {personal?.photo ? (
                <img src={personal.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Users size={40} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-gray-900 uppercase">{personal?.fullName || "Unnamed"}</h1>
              <p className="text-sm font-bold text-gray-500 mt-1 flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-600" />
                {professional?.designation || "No Designation"} • BPS {professional?.bps || "-"} • Emp ID: {professional?.personnelNo || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="flex border-b">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 font-bold text-sm uppercase tracking-widest ${
                activeTab === tab.id ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50" : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-8 min-h-[300px]">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="CNIC" value={personal?.cnic} />
              <Info label="Email" value={personal?.email} icon={<Mail size={14} />} />
              <Info label="Phone" value={personal?.phone} icon={<Phone size={14} />} />
              <Info label="Address" value={personal?.currentAddress} icon={<MapPin size={14} />} />
            </div>
          )}

          {activeTab === "professional" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Info label="Designation" value={professional?.designation} />
              <Info label="BPS" value={professional?.bps} />
              <Info label="Employee Category" value={professional?.empCategory} />
              <Info label="Date of Joining" value={professional?.doj} />
            </div>
          )}

          {activeTab === "financial" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <h4 className="font-black text-xs uppercase text-blue-600 mb-2">Allowances</h4>
                  {allowances?.map((a, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="font-bold text-gray-600">{a.name}</span>
                      <span className="font-black">Rs. {a.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border rounded-xl p-4">
                  <h4 className="font-black text-xs uppercase text-red-600 mb-2">Deductions</h4>
                  {deductions?.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="font-bold text-gray-600">{d.name}</span>
                      <span className="font-black text-red-500">- Rs. {d.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 text-white rounded-2xl p-6 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Bank Account</p>
                  <p className="font-bold">{financial?.bankName || "N/A"}</p>
                  <p className="text-sm">A/C: {financial?.accountNo || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-400 uppercase">Net Salary</p>
                  <p className="text-4xl font-black text-green-400">Rs. {netPayDetails?.netPay?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-bold text-gray-800 flex items-center gap-2">
        {icon} {value || "N/A"}
      </p>
    </div>
  );
}

export default function StaffProfilePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">Loading Profile...</div>}>
      <StaffProfileContent />
    </Suspense>
  );
}
