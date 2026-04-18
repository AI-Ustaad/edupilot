import React from "react";
import type { Metadata } from "next";
// 🚀 FIXED PATH: Going exactly 1 folder back (out of app) to reach 'context'
import { AuthProvider } from "../context/AuthContext"; 
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
