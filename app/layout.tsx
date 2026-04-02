import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduPilot - School Management System",
  description: "Pakistan's First AI Powered School Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
