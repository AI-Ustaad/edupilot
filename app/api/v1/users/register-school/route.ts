// app/api/users/register-school/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { schoolName, type, curriculum, classes, subjects } = body;

    if (!schoolName || !classes || !subjects) {
      return NextResponse.json({ error: "Missing required setup data" }, { status: 400 });
    }

    // 1. Tenant ID Determine کریں (اگر پہلے سے نہیں ہے تو UID استعمال کریں)
    const tenantId = user.tenantId || `tenant_${user.uid}`;
    
    const batch = adminDb.batch();

    // 2. User Document اپ ڈیٹ کریں (Admin Role اور Onboarding Complete)
    const userRef = adminDb.collection("users").doc(user.uid);
    batch.update(userRef, {
      onboardingRequired: false,
      role: "admin", // پہلا یوزر ہمیشہ Admin ہوگا
      tenantId: tenantId,
      updatedAt: new Date(),
    });

    // 3. Tenant (School) Document Create کریں
    const tenantRef = adminDb.collection("tenants").doc(tenantId);
    batch.set(tenantRef, {
      name: schoolName,
      type: type || "Private",
      curriculum: curriculum || "custom",
      ownerId: user.uid,
      status: "active",
      createdAt: new Date(),
    }, { merge: true });

    // 4. Settings Document (Classes & Subjects) محفوظ کریں
    const settingsRef = adminDb.collection("tenants").doc(tenantId).collection("settings").doc("config");
    batch.set(settingsRef, {
      classes: classes,
      subjects: subjects,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 5. Sections Collection خودکار Popultate کریں (تاکہ ایڈمن فوراً سٹوڈنٹس ایڈ کر سکے)
    const sectionsRef = adminDb.collection("sections");
    
    // پرانے سیکشنز ڈیلیٹ کریں (اگر دوبارہ سیٹ اپ کر رہا ہو)
    const oldSections = await sectionsRef.where("tenantId", "==", tenantId).get();
    oldSections.docs.forEach(doc => batch.delete(doc.ref));

    // ہر کلاس کے لیے ڈیفالٹ سیکشن "A" بنا دیں
    classes.forEach((cls: any) => {
      if (cls.name) {
        const newSecRef = sectionsRef.doc();
        batch.set(newSecRef, {
          tenantId: tenantId,
          classGrade: cls.name,
          sectionName: "A", // ڈیفالٹ سیکشن
          createdAt: new Date().toISOString()
        });
      }
    });

    // 6. Batch Commit کریں
    await batch.commit();

    // 7. 🚀 Custom Claims سیٹ کریں (تاکہ Firebase Security Rules فوراً کام کریں)
    await adminAuth.setCustomUserClaims(user.uid, {
      tenantId: tenantId,
      role: "admin",
    });

    return NextResponse.json({ 
      success: true, 
      message: "School setup completed successfully" 
    });

  } catch (error: any) {
    console.error("Register School API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error during setup" 
    }, { status: 500 });
  }
}
