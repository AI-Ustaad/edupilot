import "./globals.css";
import ClientWrapper from "./ClientWrapper";

export const metadata = {
  title: "EduPilot - School Management System",
  description: "Pakistan's first AI Powered School Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
