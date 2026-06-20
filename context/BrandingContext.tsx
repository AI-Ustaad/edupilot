"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface Branding {
  schoolName?: string;
  logo?: string;
  primaryColor?: string;
  customDomain?: string;
}

const BrandingContext = createContext<Branding>({});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState<Branding>({});

  useEffect(() => {
    if (!user?.tenantId) return;
    
    // 🚀 FIX: API پاتھ کو v1 کیا گیا ہے اور سیکیورٹی کے لیے credentials: "include" کا اضافہ کیا گیا ہے۔
    fetch("/api/v1/settings/whitelabel", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const b = data.data;
          setBranding(b);

          // رنگ کو CSS متغیر میں محفوظ کریں
          if (b.primaryColor) {
            document.documentElement.style.setProperty(
              "--brand-primary",
              b.primaryColor
            );
          }
          // لوگو کا URL (اگر ہو)
          if (b.logo) {
            document.documentElement.style.setProperty(
              "--brand-logo",
              `url(${b.logo})`
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
