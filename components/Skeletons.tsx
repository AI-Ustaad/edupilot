import React from "react";

// Generic Text Skeleton
export const TextSkeleton = ({ width = "w-full", height = "h-4" }: { width?: string; height?: string }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse`}></div>
);

// Card Skeleton (For Dashboard KPIs)
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

// Table Row Skeleton (For Students/Staff Directory)
export const TableRowSkeleton = ({ cols = 4 }: { cols?: number }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: cols }).map((_, idx) => (
      <td key={idx} className="p-5">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </td>
    ))}
  </tr>
);

// Full Table Skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
    <table className="w-full text-left">
      <thead className="bg-slate-50 border-b border-slate-100">
        <tr>
          {Array.from({ length: cols }).map((_, idx) => (
            <th key={idx} className="p-5"><div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse"></div></th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => <TableRowSkeleton key={idx} cols={cols} />)}
      </tbody>
    </table>
  </div>
);
