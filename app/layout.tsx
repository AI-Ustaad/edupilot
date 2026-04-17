import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
