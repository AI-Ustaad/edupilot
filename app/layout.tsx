import "./globals.css";
import ClientWrapper from "./ClientWrapper";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "EduPilot - SaaS",
  description: "School Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
