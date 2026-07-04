import React from "react";

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
        {Array.from({ length: rows }).map((_, idx) => (
          <tr key={idx}>
            {Array.from({ length: cols }).map((_, c_idx) => (
              <td key={c_idx} className="p-5">
                <div className={`h-4 bg-gray-200 rounded animate-pulse ${c_idx === 0 ? 'w-3/4' : 'w-1/2'}`}></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
