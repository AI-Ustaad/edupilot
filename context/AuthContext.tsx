"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

type UserType = {
  uid: string;
  email: string;
  role: string;
  tenantId: string;
  onboardingRequired?: boolean;
};

const AuthContext = createContext<{ user: UserType | null; loading: boolean }>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      // 🚀 FIX: Added v1 to the path and included credentials
      const res = await fetch("/api/v1/auth/me", { 
        cache: "no-store",
        credentials: "include" 
      });
      
      if (res.status === 401) {
        setUser(null);
        return;
      }
      if (!res.ok) throw new Error(`Auth Error: ${res.status}`);

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
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
