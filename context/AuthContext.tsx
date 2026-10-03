"use client";
import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";

export type UserType = {
  uid: string;
  email: string;
  role: string;
  tenantId: string;
  onboardingRequired?: boolean;
};

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  refreshUser: () => Promise<UserType | null>;
  setUser: (user: UserType | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiClient.get("/auth/me");
      const userData = safeObject(res);
      setUser(userData);
      return userData as UserType;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
