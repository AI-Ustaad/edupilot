// app/layout.tsx
import "./globals.css";
import ClientWrapper from "./ClientWrapper";
import { AuthProvider } from "@/context/AuthContext"; // <-- نیا امپورٹ

export const metadata = {
  title: "EduPilot - School Management System",
  description: "Pakistan's first AI Powered School Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* AuthProvider پوری ایپ کو سیکیور کرے گا */}
        <AuthProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
