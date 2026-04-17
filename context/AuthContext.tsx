"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const generateSchoolId = () => {
    return "school_" + Math.random().toString(36).substring(2, 8);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser = {
          name: firebaseUser.displayName || "No Name",
          email: firebaseUser.email,
          role: "admin",
          schoolId: generateSchoolId(),
          createdAt: serverTimestamp(),
        };

        await setDoc(userRef, newUser);
        setUserData(newUser);
      } else {
        setUserData(userSnap.data());
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
