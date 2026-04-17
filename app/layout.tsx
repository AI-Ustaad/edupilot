import "./globals.css";
import ClientWrapper from "./ClientWrapper";

export const metadata = {
  title: "EduPilot",
  description: "School SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
