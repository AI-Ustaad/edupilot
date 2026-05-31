"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type UserType = {
  uid: string;
  email: string;
  role: string;
  tenantId: string;
  onboardingRequired?: boolean;
};

const AuthContext = createContext<{ 
  user: UserType | null; 
  loading: boolean;
  refreshUser: () => Promise<void>;
}>({ user: null, loading: true, refreshUser: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      // 'no-store' ensures fresh data directly from the server on every reload
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) throw new Error("Auth Session Expired");
      
      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      console.error("Auth Load Error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
