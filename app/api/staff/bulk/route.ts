import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";
import { Timestamp } from "firebase-admin/firestore";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { staffList } = await req.json();
        if (!Array.isArray(staffList) || staffList.length === 0) {
          return createApiResponse(400, null, "No staff provided");
        }

        const batch = adminDb.batch();
        let createdCount = 0;

        for (const s of staffList) {
          const email = s.email || `staff_${Date.now()}_${Math.random().toString(36).substr(2, 8)}@temp.com`;
          const password = s.cnic?.replace(/[^0-9]/g, "") || "temp123456";
          let uid: string | null = null;
          try {
            const userRecord = await adminAuth.createUser({
              email, password,
              displayName: s.fullName,
            });
            uid = userRecord.uid;
            await adminAuth.setCustomUserClaims(uid, {
              role: s.role || "teacher",
              tenantId,
            });
            createdCount++;
          } catch (err) {
            console.error("User creation failed for", email, err);
            continue;
          }

          const staffPayload = {
            personal: {
              fullName: s.fullName,
              fatherName: s.fatherName || "",
              cnic: s.cnic || "",
              phone: s.phone || "",
              email,
              gender: s.gender || "Male",
              dob: s.dob || null,
            },
            professional: {
              designation: s.designation || "Teacher",
              personnelNo: s.personnelNo || "",
              doj: s.doj || null,
              bps: s.bps || "",
              empCategory: s.empCategory || "Active Permanent",
            },
            financial: {
              bankName: s.bankName || "",
              accountNo: s.accountNo || "",
              accountTitle: s.accountTitle || "",
              ntn: s.ntn || "",
            },
            allowances: [{ name: "Basic Pay", amount: Number(s.basicPay) || 0 }],
            deductions: [],
            netPayDetails: {
              grossPay: Number(s.basicPay) || 0,
              totalDeductions: 0,
              netPay: Number(s.basicPay) || 0,
            },
            loginDetails: { email, role: s.role || "teacher" },
            tenantId,
            createdBy: user.uid,
            createdAt: Timestamp.now(),
            authUid: uid,
          };

          const ref = adminDb.collection("staff").doc();
          batch.set(ref, staffPayload);
        }

        await batch.commit();
        return createApiResponse(201, { count: staffList.length, createdAuth: createdCount }, "Import complete");
      })
    )
  )
);
