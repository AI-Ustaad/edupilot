"use client";
import { AlertCircle, Clock } from "lucide-react";
import { OCRConfidence } from "./OCRConfidence";

interface ReviewQueueItem {
  id: string;
  fullName?: string;
  documentType?: string;
  confidence: number;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

interface ReviewQueueProps {
  items: ReviewQueueItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onReview?: (id: string) => void;
}

export function ReviewQueue({ items, onApprove, onReject, onReview }: ReviewQueueProps) {
  const pending = items.filter((i) => i.status === "pending");

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <Clock size={40} className="mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500 font-medium">No items pending review</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <AlertCircle size={18} className="text-amber-500" />
        <h3 className="font-bold text-gray-800">
          Review Queue {pending.length > 0 && <span className="text-amber-500">({pending.length} pending)</span>}
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-gray-900">{item.fullName || "Unknown"}</span>
                {item.documentType && (
                  <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase">{item.documentType}</span>
                )}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                item.status === "approved" ? "bg-green-50 text-green-700" :
                item.status === "rejected" ? "bg-red-50 text-red-700" :
                "bg-amber-50 text-amber-700"
              }`}>
                {item.status}
              </span>
            </div>
            <OCRConfidence confidence={item.confidence} size="sm" />
            {item.status === "pending" && (
              <div className="flex gap-2 mt-2">
                {onReview && (
                  <button onClick={() => onReview(item.id)} className="text-xs text-blue-600 font-bold hover:underline">
                    Review Details
                  </button>
                )}
                {onApprove && (
                  <button onClick={() => onApprove(item.id)} className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-green-600">
                    Approve
                  </button>
                )}
                {onReject && (
                  <button onClick={() => onReject(item.id)} className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600">
                    Reject
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
