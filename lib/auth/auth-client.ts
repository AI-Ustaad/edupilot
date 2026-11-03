// lib/auth/auth-client.ts
import { auth, db } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
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
import * as Sentry from "@sentry/nextjs";

export function mapAuthError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password. Please verify your credentials.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Access has been temporarily locked for security. Please try again later or reset your password.";
    case "auth/user-disabled":
      return "This user account has been disabled. Please contact your school administrator.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing authentication.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/account-exists-with-different-credential": {
      const email = err.customData?.email || err.email || "this email";
      return `An account already exists with ${email} using Google or Email/Password. Please sign in with that method to link your accounts.`;
    }
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return err?.message || "Authentication failed. Please try again.";
  }
}

async function syncUserRecord(user: User): Promise<any> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  let userData: any;

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

      if (activeDocs.length > 1) {
        const errorMsg = `Multiple active user documents found for ${user.email}`;
        console.error(errorMsg);
        Sentry.captureMessage(errorMsg, "error");
        throw new Error(errorMsg + ". Please contact support.");
      }

      const activeDoc = activeDocs[0] ?? querySnapshot.docs[0];
      const oldData = activeDoc.data();

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

  return userData;
}

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (popupErr: any) {
      if (popupErr.code === "auth/popup-blocked" || popupErr.code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw popupErr;
    }

    const user = result.user;
    const userData = await syncUserRecord(user);

    const idToken = await user.getIdToken(true);

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Session cookie failed (${res.status})`);
    }

    if (!userData.tenantId || userData.role === "guest" || userData.onboardingRequired) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/dashboard";
    }
  } catch (error) {
    console.error("❌ Google Login Error:", error);
    throw error instanceof Error ? error : new Error(mapAuthError(error));
  }
};

export const loginWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    provider.addScope("public_profile");

    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (popupErr: any) {
      if (popupErr.code === "auth/popup-blocked" || popupErr.code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, provider);
        return;
      }
      if (popupErr.code === "auth/account-exists-with-different-credential") {
        throw new Error(mapAuthError(popupErr));
      }
      throw popupErr;
    }

    const user = result.user;
    const userData = await syncUserRecord(user);

    const idToken = await user.getIdToken(true);

    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Session cookie failed (${res.status})`);
    }

    if (!userData.tenantId || userData.role === "guest" || userData.onboardingRequired) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/dashboard";
    }
  } catch (error) {
    console.error("❌ Facebook Login Error:", error);
    throw error instanceof Error ? error : new Error(mapAuthError(error));
  }
};

export const logoutUser = async (redirectPath: string = "/login"): Promise<void> => {
  try {
    // 1. Invalidate session cookie & revoke refresh tokens on server
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      try {
        await fetch("/api/v1/auth/session", {
          method: "DELETE",
          credentials: "include",
        });
      } catch {}
    }

    // 2. Client-side Firebase sign-out
    if (auth.currentUser) {
      await signOut(auth);
    }

    // 3. Purge storage & cached state
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      window.location.href = redirectPath;
    }
  } catch (err) {
    console.error("Logout failed:", err);
    if (typeof window !== "undefined") {
      window.location.href = redirectPath;
    }
  }
};
