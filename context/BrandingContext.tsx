"use client";
import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

const BrandingContext = createContext<any>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    if (!user?.tenantId) return;
    
    apiClient.get("/settings/whitelabel")
      .then(res => {
        const data = safeObject(res);
        setBranding(data);
      })
      .catch(() => setBranding(null));
  }, [user?.tenantId]);

  return (
    <BrandingContext.Provider value={{ branding, setBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export const useBranding = () => useContext(BrandingContext);
