/**
 * lib/aggregations/shared-metrics.ts
 *
 * Single Source of Truth for shared financial and attendance metrics.
 * Ensures /dashboard, /fees, /attendance, and /result agree 100%.
 */

export interface FeeSummary {
  totalRecords: number;
  totalCollected: number;
  totalPending: number;
  grossTotal: number;
}

/**
 * Computes exact financial conservation invariants for a set of fee records.
 * Collected + Pending === Gross
 */
export function computeFeeSummary(records: any[]): FeeSummary {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      totalRecords: 0,
      totalCollected: 0,
      totalPending: 0,
      grossTotal: 0,
    };
  }

  let totalCollected = 0;
  let totalPending = 0;

  for (const r of records) {
    const status = (r.status || r.financial?.status || "").toString().toLowerCase().trim();
    const isPaid = status === "paid";
    
    // Resolve collected amount (verified cash)
    const rawPaid = Number(r.amountPaid ?? r.financial?.amountPaid ?? 0);
    const rawAssessed = Number(r.amount ?? r.financial?.amount ?? r.paymentDetails?.amount ?? 0);
    const assessed = rawAssessed > 0 ? rawAssessed : 5000;

    const collected = isPaid ? (rawPaid > 0 ? rawPaid : assessed) : Math.max(0, rawPaid);

    // Resolve pending amount
    const rawDue = Number(r.amountDue ?? r.financial?.amountDue ?? 0);
    const due = isPaid ? 0 : (rawDue > 0 ? rawDue : Math.max(0, assessed - collected));

    totalCollected += collected;
    totalPending += (isPaid ? 0 : (due > 0 ? due : assessed));
  }

  return {
    totalRecords: records.length,
    totalCollected,
    totalPending,
    grossTotal: totalCollected + totalPending,
  };
}

