"use client";

import { useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

const TABS = ["Class", "Section", "Allocation"];

export default function SectionsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900">
          Sections & Class Allocation
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl shadow-inner">
          {TABS.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === index
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 min-h-[400px] shadow-sm">
          {activeTab === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Class Management</h2>
              <p className="text-gray-500">Create new master classes or edit existing ones.</p>
              
              <div className="mt-8 p-10 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-gray-400 font-medium">Class management component will render here.</p>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Section Management</h2>
              <p className="text-gray-500">Assign multiple sections (e.g., A, Blue, Rose) to specific classes.</p>
              
              <div className="mt-8 p-10 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-gray-400 font-medium">Section creation component will render here.</p>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Allocation</h2>
              <p className="text-gray-500">Allocate class teachers and subjects to specific sections.</p>
              
              <div className="mt-8 p-10 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-gray-400 font-medium">Teacher allocation grid will render here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
