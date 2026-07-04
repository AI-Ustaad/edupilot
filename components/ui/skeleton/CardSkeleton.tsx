import React from "react";

export const CardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-full">
        <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mt-2"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-80">
        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-80">
        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    </div>
  </div>
);
