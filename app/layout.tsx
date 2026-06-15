// app/(protected)/layout.tsx
import dynamic from "next/dynamic";
import SidebarLayout from "@/components/SidebarLayout";
import { ReactNode } from "react";

// 🛡️ RouteGuard کو صرف Client پر چلانے کی سخت ہدایت (Fixes Vercel Pre-render error)
const RouteGuard = dynamic(() => import("@/components/RouteGuard"), {
  ssr: false,
});

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarLayout>
      <RouteGuard>
        {children}
      </RouteGuard>
    </SidebarLayout>
  );
}
