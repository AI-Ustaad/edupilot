"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UserType = {
  uid: string;
  email: string;
  role: string;
  schoolId: string;
};

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        // basic auth check
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error();

        const basic = await res.json();

        // full user data
        const doc = await fetch("/api/users/get");
        const userData = await doc.json();

        setUser({ ...basic, ...userData });
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
