"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (lang: string) => {
    // 👈 URL میں /en ڈالنے کے بجائے کُکی (Cookie) استعمال کریں
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    router.refresh();
    setIsOpen(false);
  };

  const languageNames: Record<string, string> = {
    en: "English",
    ur: "اردو",
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
      >
        🌐 {languageNames[locale]}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          {Object.entries(languageNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => switchLanguage(code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-xl last:rounded-b-xl ${locale === code ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
