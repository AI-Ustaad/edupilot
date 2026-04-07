"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase"; 
import { onIdTokenChanged, User, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: string | null;
  schoolId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onIdTokenChanged ہر بار چلتا ہے جب یوزر لاگ ان ہوتا ہے یا اس کا ٹوکن ریفریش ہوتا ہے
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          
          // 1. یوزر کا رول اور سکول آئی ڈی فائر سٹور سے منگوائیں
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setRole(userDoc.data().role);
            setSchoolId(userDoc.data().schoolId);
          } else {
            setRole("student"); // اگر ڈیٹا نہ ملے تو ڈیفالٹ سٹوڈنٹ
          }

          // 2. سیکیورٹی کے لیے ٹوکن بیک اینڈ (API) کو بھیجیں تاکہ کوکی (Cookie) بن سکے
          const idToken = await firebaseUser.getIdToken();
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          setUser(firebaseUser);
        } else {
          // 3. اگر یوزر لاگ آؤٹ ہو جائے تو سیشن کوکی بھی ڈیلیٹ کر دیں
          await fetch('/api/auth/logout', { method: 'POST' });
          setUser(null);
          setRole(null);
          setSchoolId(null);
        }
      } catch (error) {
        console.error("Auth Sync Error:", error);
      } finally {
        // 4. یہ سب سے اہم لائن ہے! چاہے ایرر آئے یا لاگ ان ہو، لوڈنگ سکرین کو بند کر دو
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, schoolId, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
