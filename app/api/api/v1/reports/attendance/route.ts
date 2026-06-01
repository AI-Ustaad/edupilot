// app/api/v1/reports/attendance/route.ts
export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const url = new URL(req.url);
      const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
      const format = url.searchParams.get("format") || "pdf";
      const service = new ReportService();
      if (format === "csv") {
        const csv = await service.generateAttendanceCSV(tenantId, month);
        return new Response(csv, { headers: { "Content-Type": "text/csv" } });
      }
      const pdfBuffer = await service.generateAttendanceReport(tenantId, month);
      return new Response(pdfBuffer, { headers: { "Content-Type": "application/pdf" } });
    })
  )
);
