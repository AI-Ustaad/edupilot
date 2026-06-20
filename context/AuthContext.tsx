"use client";
import { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    async function loadUser() {
      try {
        // FIXED: /api/v1/auth/me — v1 path صحیح ہے
        const res = await fetch("/api/v1/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const userData = await res.json();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
