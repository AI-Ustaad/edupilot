// ==========================================
// 1. GET: Fetch Sections Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const snap = await adminDb.collection("sections")
          .where("tenantId", "==", tenantId)
          .get();
        
        // ✅ ULTIMATE FIX: Cast d.data() to 'any' to bypass strict type inference
        const sections = snap.docs.map(d => ({ 
          id: d.id, 
          ...(d.data() as any) // 👈 This tells TypeScript: "Trust me, I know what's inside"
        })).filter((s: any) => !s.deleted); // 👈 Also cast 's' to any in filter

        return NextResponse.json({ success: true, data: sections });
      })
    )
  )
);
