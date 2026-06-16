import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { withPermission } from "@/lib/auth/withPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// Initialize Service (Dependency Injection)
const feesService = new FeesService(new FeesRepository());

// 🟢 GET: Fetch Fees & Revenue Data (Protected by fees.view)
export const GET = withPermission(PERMISSIONS.fees.view, async (req: Request, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    
    // Fetching all fee records or recent payments based on your service
    const feeRecords = await feesService.getAll(tenantId); 
    
    return successResponse(feeRecords, "Fee records fetched successfully");
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch fee records", 500);
  }
});

// 🔵 POST: Collect / Create New Fee Invoice (Protected by fees.create)
export const POST = withPermission(PERMISSIONS.fees.create, async (req: Request, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const body = await req.json();
    
    // Service ensures correct calculations and audit logging before saving
    const newFeeRecord = await feesService.create(body, tenantId);
    
    return successResponse(newFeeRecord, "Fee collected and recorded successfully", 201);
  } catch (error: any) {
    const status = error.message?.includes("Validation") ? 400 : 500;
    return errorResponse(error.message || "Failed to process fee", status);
  }
});
