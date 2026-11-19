"use client";
import React from "react";

interface FormattedAiTextProps {
  content: string;
  className?: string;
}

export function FormattedAiText({ content, className = "" }: FormattedAiTextProps) {
  if (!content) return null;

  // Split lines
  const lines = content.split("\n");

  const parseInline = (text: string): React.ReactNode[] => {
    // Split by bold (**bold**) and inline code (`code`)
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={`${match.index}-b`} className="font-bold text-gray-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code key={`${match.index}-c`} className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded font-mono text-xs">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`space-y-2 text-sm leading-relaxed ${className}`}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading 1 / 2 / 3
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-base font-bold text-gray-900 mt-3 mb-1">
              {parseInline(line.slice(4))}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg font-black text-gray-900 mt-4 mb-1.5 border-b pb-1">
              {parseInline(line.slice(3))}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-xl font-black text-gray-900 mt-4 mb-2">
              {parseInline(line.slice(2))}
            </h1>
          );
        }

        // Bullet list item
        if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2 my-0.5">
              <span className="text-blue-500 font-bold text-base leading-none select-none">•</span>
              <span className="flex-1 text-gray-800">{parseInline(line.slice(2))}</span>
            </div>
          );
        }

        // Numbered list item
        const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-2 my-1">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full select-none">
                {numberedMatch[1]}
              </span>
              <span className="flex-1 text-gray-800">{parseInline(numberedMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph line
        return (
          <p key={idx} className="text-gray-800">
            {parseInline(line)}
          </p>
        );
      })}
    </div>
  );
}
