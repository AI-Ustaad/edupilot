import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { aiRateLimit } from "@/lib/ratelimit";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withRateLimit(aiRateLimit)(   // <-- AI specific limit (20 req/min)
      withTenant(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        // Your AI chatbot logic here
        // ...
        return new Response(JSON.stringify({ success: true, message: "AI response placeholder" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      })
    )
  )
);
