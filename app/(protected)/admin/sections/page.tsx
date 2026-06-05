export const dynamic = 'force-dynamic';
"use client";

import { useState } from "react";

const TABS = ["Class", "Section", "Allocation"];

export default function SectionsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">
        Sections Allocation
      </h1>

      {/* ٹیبز – سب کام کر رہے ہیں */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {TABS.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === index
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ٹیب مواد */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 min-h-[300px]">
        {activeTab === 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Class Management</h2>
            <p className="text-gray-600">Add or edit classes here.</p>
            {/* یہاں کلاسز کی فہرست اور فارم */}
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Section Management</h2>
            <p className="text-gray-600">Assign sections to classes.</p>
            {/* یہاں سیکشن کی فہرست اور فارم */}
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Allocation</h2>
            <p className="text-gray-600">Allocate teachers to sections.</p>
            {/* یہاں ٹیچر ایلوکیشن کا مواد */}
          </div>
        )}
      </div>
    </div>
  );
}
