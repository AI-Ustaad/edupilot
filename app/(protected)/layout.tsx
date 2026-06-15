import dynamic from "next/dynamic";
import SidebarLayout from "@/components/SidebarLayout";
import { ReactNode } from "react";

const RouteGuard = dynamic(() => import("@/components/RouteGuard"), {
  ssr: false,
});

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout>
      <RouteGuard>{children}</RouteGuard>
    </SidebarLayout>
  );
}
