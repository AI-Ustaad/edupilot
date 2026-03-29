import React from "react";
import "./globals.css";

export const metadata = {
  title: "EduPilot",
  description: "School Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8F9FE]">
        {children}
      </body>
    </html>
  );
}
