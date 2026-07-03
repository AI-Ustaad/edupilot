"use client";
import { useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";

const TABS = ["Class", "Section", "Allocation"];

export default function SectionsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { data: classes = [], isLoading } = useClasses();

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Sections & Class Allocation</h1>

        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl shadow-inner">
          {TABS.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === index ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 min-h-[400px] shadow-sm">
          {activeTab === 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Class Management</h2>
              <p className="text-gray-500 mb-4">Create new master classes or edit existing ones.</p>
              {isLoading ? <p>Loading classes...</p> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from(new Set(classes.map((c: any) => c.classGrade))).map(cls => (
                    <div key={cls} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center font-bold text-gray-700">
                      Class {cls}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Section Management</h2>
              <p className="text-gray-500">Assign multiple sections to specific classes.</p>
              <div className="mt-8 p-10 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 font-medium">
                Section management component will render here.
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Allocation</h2>
              <p className="text-gray-500">Allocate class teachers and subjects to specific sections.</p>
              <div className="mt-8 p-10 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400 font-medium">
                Teacher allocation grid will render here.
              </div>
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
