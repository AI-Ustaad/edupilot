"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface Branding {
  schoolName?: string;
  logo?: string;
  primaryColor?: string;
  customDomain?: string;
  timezone?: string;            // 👈 newly added
}

const BrandingContext = createContext<Branding>({});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState<Branding>({});

  useEffect(() => {
    if (!user?.tenantId) return;
    fetch("/api/settings/whitelabel")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const b = data.data;
          setBranding(b);

          // Primary colour → CSS variable
          if (b.primaryColor) {
            document.documentElement.style.setProperty(
              "--brand-primary",
              b.primaryColor
            );
          }

          // Logo URL → CSS variable (useful for CSS backgrounds)
          if (b.logo) {
            document.documentElement.style.setProperty(
              "--brand-logo",
              `url(${b.logo})`
            );
          }

          // Timezone → CSS variable (optional, can be used by helper utilities)
          if (b.timezone) {
            document.documentElement.style.setProperty(
              "--brand-timezone",
              b.timezone
            );
          }
        }
      })
      .catch(console.error);
  }, [user?.tenantId]);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
