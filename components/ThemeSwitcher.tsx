"use client";
import { useTheme } from "./ThemeProvider";
import { Check } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {availableThemes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className="flex items-center justify-between p-2 rounded-lg border"
          style={{ backgroundColor: t.bgCard, color: t.textPrimary }}
        >
          <span className="text-sm font-medium">{t.label}</span>
          {theme.name === t.name && <Check size={14} />}
        </button>
      ))}
    </div>
  );
}
