"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/api/client";
import {
  Sliders, ArrowLeft, Save, Loader2, CheckCircle,
  DollarSign, Shield, Layers, Tag, Percent, RefreshCw,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface ClassFee {
  classGrade: string;
  amount: number;
}

interface FeeCategory {
  name: string;
  feeType: string;
  amount: number;
  frequency: string;
}

interface DiscountPolicy {
  name: string;
  percentage: number;
  type: string;
}

export default function FeeStructurePage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [classFees, setClassFees] = useState<ClassFee[]>([
    { classGrade: "Class 1", amount: 5000 },
    { classGrade: "Class 2", amount: 5000 },
    { classGrade: "Class 3", amount: 5000 },
    { classGrade: "Class 4", amount: 5000 },
    { classGrade: "Class 5", amount: 5000 },
    { classGrade: "Class 6", amount: 5000 },
    { classGrade: "Class 7", amount: 5000 },
    { classGrade: "Class 8", amount: 5000 },
    { classGrade: "Class 9", amount: 5000 },
    { classGrade: "Class 10", amount: 5000 },
  ]);

  const [categories, setCategories] = useState<FeeCategory[]>([
    { name: "Monthly Tuition Fee", feeType: "Tuition", amount: 5000, frequency: "Monthly" },
    { name: "Admission Fee", feeType: "Admission", amount: 10000, frequency: "One-Time" },
    { name: "Examination Fee", feeType: "Other", amount: 1500, frequency: "Termly" },
    { name: "Transport Fee", feeType: "Transport", amount: 3000, frequency: "Monthly" },
  ]);

  const [discounts, setDiscounts] = useState<DiscountPolicy[]>([
    { name: "Sibling Discount", percentage: 20, type: "percentage" },
    { name: "Need-Based Scholarship", percentage: 50, type: "percentage" },
    { name: "Staff Ward Discount", percentage: 100, type: "percentage" },
  ]);

  useEffect(() => {
    async function loadStructure() {
      if (!user?.tenantId) return;
      try {
        setLoading(true);
        const res: any = await apiClient.get("/fees/structure");
        const data = res?.data || res;
        if (data?.classFees && data.classFees.length > 0) {
          setClassFees(data.classFees);
        }
        if (data?.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (data?.discounts && data.discounts.length > 0) {
          setDiscounts(data.discounts);
        }
      } catch (err: any) {
        console.error("Failed to load fee structure:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStructure();
  }, [user?.tenantId]);

  const handleClassFeeChange = (classGrade: string, val: string) => {
    const num = Number(val) || 0;
    setClassFees((prev) =>
      prev.map((cf) => (cf.classGrade === classGrade ? { ...cf, amount: num } : cf))
    );
  };

  const handleApplyAllTuition = (amount: number) => {
    setClassFees((prev) => prev.map((cf) => ({ ...cf, amount })));
  };

  const handleCategoryAmountChange = (index: number, val: string) => {
    const num = Number(val) || 0;
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: num };
      return updated;
    });
  };

  const handleDiscountChange = (index: number, val: string) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setDiscounts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], percentage: num };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiClient.post("/fees/structure", {
        classFees,
        categories,
        discounts,
      });
      setSuccess("Fee structure saved successfully! Active student fees updated.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save fee structure.");
    } finally {
      setSaving(false);
    }
  };

  if (!user?.tenantId) return <div className="p-8 text-center font-bold">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/fees" className="hover:text-green-600 transition flex items-center gap-1 font-medium">
              <ArrowLeft size={16} /> Fees
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-bold">Fee Structure</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Sliders className="text-green-600" /> Fee Structure & Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Define canonical tuition fees for Class 1–10, institutional fee categories, and concession policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/fees"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
          >
            <ArrowLeft size={18} /> Back to Fees
          </Link>
          <RequirePermission permissions={[PERMISSIONS.fees.create]}>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Fee Structure
            </button>
          </RequirePermission>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-bold border border-green-200 shadow-sm">
          <CheckCircle size={20} /> {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2 font-bold border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-green-600" size={36} />
          <p className="text-gray-500 font-medium">Loading institutional fee structure...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card 1: Class-Wise Monthly Tuition Fees */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="text-blue-600" size={20} /> Class Tuition Fees (Monthly)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Standard recurring fee assessed to every active student per billing cycle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyAllTuition(5000)}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
              >
                Set All Classes to Rs. 5,000
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
              {classFees.map((cf) => (
                <div key={cf.classGrade} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm transition">
                  <span className="text-xs font-black text-gray-600 uppercase tracking-wider block mb-1">
                    {cf.classGrade}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400">Rs.</span>
                    <input
                      type="number"
                      value={cf.amount}
                      onChange={(e) => handleClassFeeChange(cf.classGrade, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 font-black text-gray-900 bg-white text-right focus:outline-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block text-right">/ student / month</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Core Fee Categories */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Tag className="text-green-600" size={20} /> Institutional Fee Categories
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Standard charge heads and collection intervals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {categories.map((cat, idx) => (
                <div key={cat.name} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white transition space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      {cat.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-400">Rs.</span>
                    <input
                      type="number"
                      value={cat.amount}
                      onChange={(e) => handleCategoryAmountChange(idx, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 font-black text-gray-900 bg-white text-right focus:outline-green-500"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block text-right">Type: {cat.feeType}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Concessions & Discounts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Percent className="text-purple-600" size={20} /> Discounts & Concession Policies
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Approved standard waivers applied to eligible enrolled students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {discounts.map((d, idx) => (
                <div key={d.name} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-white transition space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">{d.name}</span>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      {d.percentage}% Off
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={d.percentage}
                      onChange={(e) => handleDiscountChange(idx, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 font-black text-gray-900 bg-white text-right focus:outline-purple-500"
                    />
                    <span className="text-sm font-bold text-gray-500">%</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block text-right">Applied on monthly tuition</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
