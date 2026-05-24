"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, ThemeName, themes } from "@/lib/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (name: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("default");

  useEffect(() => {
    const saved = localStorage.getItem("dashboardTheme") as ThemeName;
    if (saved && themes[saved]) setThemeName(saved);
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem("dashboardTheme", name);
    applyTheme(themes[name]);
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty("--bg-page", theme.bgPage);
    root.style.setProperty("--bg-card", theme.bgCard);
    root.style.setProperty("--bg-sidebar", theme.bgSidebar);
    root.style.setProperty("--bg-input", theme.bgInput);
    root.style.setProperty("--text-primary", theme.textPrimary);
    root.style.setProperty("--text-secondary", theme.textSecondary);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-hover", theme.primaryHover);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--warning", theme.warning);
    root.style.setProperty("--danger", theme.danger);
  };

  useEffect(() => {
    applyTheme(themes[themeName]);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], setTheme, availableThemes: Object.values(themes) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
