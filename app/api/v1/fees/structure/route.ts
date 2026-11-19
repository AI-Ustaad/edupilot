export const dynamic = "force-dynamic";
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { FeeStructureRepository } from "@/repositories/fee-structure.repository";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";
import { invalidateCache } from "@/lib/cache";
import { adminDb } from "@/lib/firebase-admin";

const feeStructureRepo = new FeeStructureRepository();

const DEFAULT_CLASS_FEES = [
  { classGrade: "Class 1", amount: 5000 },
  { classGrade: "Class 2", amount: 5000 },
  { classGrade: "Class 3", amount: 5000 },
  { classGrade: "Class 4", amount: 5000 },
  { classGrade: "Class 5", amount: 5000 },
  { classGrade: "Class 6", amount: 5000 },
  { classGrade: "Class 7", amount: 5000 },
  { classGrade: "Class 8", amount: 5000 },
  { classGrade: "Class 9", amount: 5000 },
  { classGrade: "Class 10", amount: 5000 },
];

const DEFAULT_CATEGORIES = [
  { name: "Monthly Tuition Fee", feeType: "Tuition", amount: 5000, frequency: "Monthly" },
  { name: "Admission Fee", feeType: "Admission", amount: 10000, frequency: "One-Time" },
  { name: "Examination Fee", feeType: "Other", amount: 1500, frequency: "Termly" },
  { name: "Transport Fee", feeType: "Transport", amount: 3000, frequency: "Monthly" },
];

const DEFAULT_DISCOUNTS = [
  { name: "Sibling Discount", percentage: 20, type: "percentage" },
  { name: "Need-Based Scholarship", percentage: 50, type: "percentage" },
  { name: "Staff Ward Discount", percentage: 100, type: "percentage" },
];

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.fees.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const existing = await feeStructureRepo.getFeeStructures(tenantId);

      if (existing.length === 0) {
        return createSuccessResponse({
          classFees: DEFAULT_CLASS_FEES,
          categories: DEFAULT_CATEGORIES,
          discounts: DEFAULT_DISCOUNTS,
          isDefault: true,
        });
      }

      // Map existing records
      const classFees = DEFAULT_CLASS_FEES.map((d) => {
        const found = existing.find((item: any) => item.classGrade === d.classGrade || item.classId === d.classGrade);
        return { classGrade: d.classGrade, amount: found ? Number(found.amount) : d.amount };
      });

      const categories = existing.filter((item: any) => !item.classGrade && item.feeType).length > 0
        ? existing.filter((item: any) => !item.classGrade && item.feeType)
        : DEFAULT_CATEGORIES;

      const discountsItem = existing.find((item: any) => item.name === "discounts_config");
      const discounts = discountsItem?.discounts || DEFAULT_DISCOUNTS;

      return createSuccessResponse({
        classFees,
        categories,
        discounts,
        isDefault: false,
      });
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.fees.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const userId = context.user.uid;
      const body = await req.json();

      const { classFees = [], categories = [], discounts = [] } = body;
      const db = adminDb;
      const batch = db.batch();

      // Upsert class monthly fees
      for (const cf of classFees) {
        const docId = `fee_struct_${tenantId}_${cf.classGrade.replace(/\s+/g, "_").toLowerCase()}`;
        const ref = db.collection("fee_structures").doc(docId);
        batch.set(ref, {
          id: docId,
          name: `${cf.classGrade} Tuition Fee`,
          feeType: "Tuition",
          classGrade: cf.classGrade,
          classId: cf.classGrade,
          amount: Number(cf.amount) || 5000,
          frequency: "Monthly",
          tenantId,
          deleted: false,
          updatedBy: userId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      // Upsert fee categories
      for (const cat of categories) {
        const docId = `fee_cat_${tenantId}_${cat.name.replace(/\s+/g, "_").toLowerCase()}`;
        const ref = db.collection("fee_structures").doc(docId);
        batch.set(ref, {
          id: docId,
          name: cat.name,
          feeType: cat.feeType || "Other",
          amount: Number(cat.amount) || 0,
          frequency: cat.frequency || "Monthly",
          tenantId,
          deleted: false,
          updatedBy: userId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      // Save discounts configuration
      const discDocId = `fee_disc_${tenantId}`;
      const discRef = db.collection("fee_structures").doc(discDocId);
      batch.set(discRef, {
        id: discDocId,
        name: "discounts_config",
        discounts,
        tenantId,
        deleted: false,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      await batch.commit();
      await invalidateCache(`fees:structure:${tenantId}`);

      return createApiResponse(200, { classFees, categories, discounts }, "Fee structure updated successfully");
    }
  )
);
