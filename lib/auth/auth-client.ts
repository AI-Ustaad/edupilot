// lib/auth/auth-client.ts
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import * as Sentry from "@sentry/nextjs";           // ✅ Sentry for duplicate detection

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let userData;

    if (!userSnap.exists()) {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", user.email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const activeDocs = querySnapshot.docs.filter(
          (d) => d.data().status !== "migrated"
        );

        // 🆕 Duplicate active‑document detection + monitoring
        if (activeDocs.length > 1) {
          const errorMsg = `Multiple active user documents found for ${user.email}`;
          console.error(errorMsg);
          Sentry.captureMessage(errorMsg, "error");
          throw new Error(errorMsg + ". Please contact support.");
        }

        const activeDoc = activeDocs[0] ?? querySnapshot.docs[0];
        const oldData = activeDoc.data();

        // Sanitize migration fields from old document
        const {
          migratedTo,
          status,
          migrationVersion,
          migrationCompletedAt,
          migratedFrom,
          ...cleanUserData
        } = oldData;

        await setDoc(
          userRef,
          {
            ...cleanUserData,
            uid: user.uid,
            migratedFrom: activeDoc.id,
            migrationVersion: 1,
            migrationCompletedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );

        if (activeDoc.id !== user.uid) {
          await setDoc(
            doc(db, "users", activeDoc.id),
            {
              migratedTo: user.uid,
              status: "migrated",
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        userData = cleanUserData;
        console.log("🔗 Email fallback: old role linked to new UID");
      } else {
        userData = {
          email: user.email,
          name: user.displayName || "New User",
          photoURL: user.photoURL || "",
          role: "guest",
          tenantId: null,
          onboardingRequired: true,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, userData);
        console.log("🆕 New guest user created");
      }
    } else {
      userData = userSnap.data();
      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    const idToken = await user.getIdToken(true);

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        data.error ?? `Session cookie failed (${res.status})`
      );
    }

    if (
      !userData.tenantId ||
      userData.role === "guest" ||
      userData.onboardingRequired
    ) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/dashboard";
    }
  } catch (error) {
    console.error("❌ Firebase Login Error:", error);
    // 🆕 Typed error propagation
    throw error instanceof Error
      ? error
      : new Error("Login failed", { cause: error });
  }
};
