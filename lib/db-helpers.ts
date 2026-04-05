import { collection, query, where, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 1. Fetch data filtered by School ID
export const getTenantQuery = (collectionName: string, schoolId: string | null) => {
  if (!schoolId) throw new Error("No School ID provided");
  return query(collection(db, collectionName), where("schoolId", "==", schoolId));
};

// 2. Add data with Auto-Injected School ID
export const addTenantDoc = async (collectionName: string, data: any, schoolId: string | null) => {
  if (!schoolId) throw new Error("No School ID provided");
  return await addDoc(collection(db, collectionName), {
    ...data,
    schoolId: schoolId, // Auto-attaching the tenant ID
    createdAt: new Date().toISOString()
  });
};
