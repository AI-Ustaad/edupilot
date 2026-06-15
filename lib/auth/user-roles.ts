// lib/auth/user-roles.ts
import { db } from "@/lib/firebase"; // آپ کے کلائنٹ سائیڈ فائر بیس کا پاتھ
import { doc, getDoc } from "firebase/firestore";

export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}
