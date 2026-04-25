import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout"; // 👈 آپ کے component کا پاتھ

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduPilot SaaS",
  description: "Next-Generation School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {/* 👉 سائیڈ بار اب پوری ایپ کو کنٹرول کرے گا */}
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}
