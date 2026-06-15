import SidebarLayout from "@/components/SidebarLayout";
import RouteGuard from "@/components/RouteGuard";
import { ReactNode } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarLayout>
      {/* 🛡️ RouteGuard ہر پیج کے URL کو چیک کرے گا اور غیر مجاز رسائی کو روکے گا */}
      <RouteGuard>
        {children}
      </RouteGuard>
    </SidebarLayout>
  );
}
