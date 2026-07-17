"use client";

interface OCRConfidenceProps {
  confidence: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getColor(score: number): string {
  if (score >= 0.8) return "bg-green-500";
  if (score >= 0.6) return "bg-yellow-500";
  return "bg-red-500";
}

function getLabel(score: number): string {
  if (score >= 0.8) return "High";
  if (score >= 0.6) return "Medium";
  return "Low";
}

export function OCRConfidence({ confidence, size = "md", showLabel = true }: OCRConfidenceProps) {
  const height = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  const percent = Math.round(confidence * 100);

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 rounded-full ${height}`}>
        <div
          className={`${height} rounded-full transition-all ${getColor(confidence)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-gray-600 min-w-[4rem] text-right">
          {percent}% {getLabel(confidence)}
        </span>
      )}
    </div>
  );
}
