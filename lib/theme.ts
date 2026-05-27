export type ThemeName = "default" | "ocean" | "forest" | "sunset" | "midnight" | "royal";

export interface Theme {
  name: ThemeName;
  label: string;
  // Backgrounds
  bgPage: string;     // page background
  bgCard: string;     // cards, modals, white boxes
  bgSidebar: string;  // sidebar background
  bgInput: string;    // input fields background
  // Text
  textPrimary: string;   // main text (headings, body)
  textSecondary: string; // subtle text (placeholders, labels)
  // Borders
  border: string;
  // Accents
  primary: string;
  primaryHover: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
}

export const themes: Record<ThemeName, Theme> = {
  default: {
    name: "default",
    label: "Default Blue",
    bgPage: "#f8fafc",
    bgCard: "#1f2937",
    bgSidebar: "#1f2937",
    bgInput: "#f1f5f9",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
  ocean: {
    name: "ocean",
    label: "Ocean Teal",
    bgPage: "#ecfdf5",
    bgCard: "#1f2937",
    bgSidebar: "#1f2937",
    bgInput: "#f0fdf4",
    textPrimary: "#064e3b",
    textSecondary: "#047857",
    border: "#d1fae5",
    primary: "#0d9488",
    primaryHover: "#0f766e",
    secondary: "#14b8a6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
  forest: {
    name: "forest",
    label: "Forest Green",
    bgPage: "#f0fdf4",
    bgCard: "#1f2937",
    bgSidebar: "#1f2937",
    bgInput: "#f0fdf4",
    textPrimary: "#14532d",
    textSecondary: "#166534",
    border: "#bbf7d0",
    primary: "#16a34a",
    primaryHover: "#15803d",
    secondary: "#22c55e",
    success: "#10b981",
    warning: "#eab308",
    danger: "#ef4444",
  },
  sunset: {
    name: "sunset",
    label: "Sunset Orange",
    bgPage: "#fff7ed",
    bgCard: "#1f2937",
    bgSidebar: "#1f2937",
    bgInput: "#fff7ed",
    textPrimary: "#7c2d12",
    textSecondary: "#9a3412",
    border: "#fed7aa",
    primary: "#ea580c",
    primaryHover: "#c2410c",
    secondary: "#f97316",
    success: "#10b981",
    warning: "#eab308",
    danger: "#ef4444",
  },
  midnight: {
    name: "midnight",
    label: "Midnight Purple",
    bgPage: "#faf5ff",
    bgCard: "#1f2937",
    bgSidebar: "#1f2937",
    bgInput: "#faf5ff",
    textPrimary: "#4c1d95",
    textSecondary: "#6d28d9",
    border: "#e9d5ff",
    primary: "#7e22ce",
    primaryHover: "#6b21a8",
    secondary: "#a855f7",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
  royal: {
    name: "royal",
    label: "Royal Gold",
    bgPage: "#fefce8",
    bgCard: "#1f2937",
    bgSidebar: "#1f2937",
    bgInput: "#fefce8",
    textPrimary: "#713f12",
    textSecondary: "#854d0e",
    border: "#fef08a",
    primary: "#ca8a04",
    primaryHover: "#a16207",
    secondary: "#eab308",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
};
