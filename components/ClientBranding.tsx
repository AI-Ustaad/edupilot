"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function ClientBranding({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [style, setStyle] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.tenantId) return;
    fetch("/api/settings/whitelabel")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const branding = data.data;
          document.documentElement.style.setProperty("--brand-primary", branding.primaryColor || "#3b82f6");
          if (branding.logo) {
            document.documentElement.style.setProperty("--brand-logo", `url(${branding.logo})`);
          }
        }
      });
  }, [user]);

  return <>{children}</>;
}
