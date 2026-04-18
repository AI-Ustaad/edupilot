import React from "react";
import type { Metadata } from "next";
import { AuthProvider } from "./context/AuthContext"; // 🚀 Fixed Path: Using ./ since they are in the same 'app' folder
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
