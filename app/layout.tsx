import React from "react";
import type { Metadata } from "next";
import { AuthProvider } from "@/app/context/AuthContext"; // 🚀 Vercel Error Fixed (Absolute Path)
import "./globals.css";

export const metadata: Metadata = {
  title: "EduPilot | School Management System",
  description: "Pakistan's #1 AI Powered School Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fafbfc] text-[#111] antialiased">
        {/* AuthProvider پوری ایپ کو سیکیورٹی اور یوزر سیشن فراہم کرے گا */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
