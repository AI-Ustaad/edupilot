export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { AuthService } from "@/services/auth.service";
import { ParentsService } from "@/services/parents.service";
import { StudentRepository } from "@/repositories/student.repository";
import { RegisterParentSchema } from "@/validators/parent";
import type { TenantContext } from "@/types/api";

const authService = new AuthService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.parents.view)(async (req: Request, { tenantId }: TenantContext) => {
        const service = new ParentsService();
        const studentRepo = new StudentRepository();

        // 1. Fetch registered parent accounts & student directory
        const [registeredParentsRes, allStudents] = await Promise.all([
          service.paginate(tenantId, 1, 100).catch(() => ({ data: [], total: 0 })),
          studentRepo.findAll(tenantId).catch(() => []),
        ]);

        const registeredParents = registeredParentsRes.data || [];
        const studentMap = new Map<string, any>();
        for (const s of (allStudents as any[])) {
          if (s.id) studentMap.set(s.id, s);
        }

        const result: any[] = [];
        const linkedStudentIds = new Set<string>();

        // 2. Map registered parents with their linked student info
        for (const p of registeredParents) {
          const studentIds = p.relationships?.studentIds || (p as any).studentIds || [];
          const linkedStudents = studentIds.map((id: string) => {
            linkedStudentIds.add(id);
            const st = studentMap.get(id);
            return st 
              ? { id: st.id, name: st.fullName || st.name, classGrade: st.classGrade, section: st.section } 
              : { id, name: "Student", classGrade: "", section: "" };
          });

          const fullName = p.personal?.fullName || (p as any).fullName || (p as any).name || "Parent Account";
          const email = p.personal?.email || (p as any).email || "";
          const phone = p.personal?.phone || (p as any).phone || "—";

          result.push({
            id: p.parentId || p.id,
            fullName,
            email,
            phone,
            accountType: "Registered Portal User",
            students: linkedStudents,
            createdAt: p.metadata?.createdAt || p.createdAt,
          });
        }

        // 3. Aggregate student guardians from student admission profiles
        for (const s of (allStudents as any[])) {
          const guardianName = s.guardianName || s.fatherName;
          const guardianPhone = s.guardianPhone || s.phone || s.emergencyContact;
          const guardianEmail = s.guardianEmail || "";

          if (guardianName && !linkedStudentIds.has(s.id)) {
            const existing = result.find(r => 
              (guardianPhone && r.phone !== "—" && r.phone === guardianPhone) ||
              (guardianName && r.fullName.toLowerCase() === guardianName.toLowerCase())
            );

            if (existing) {
              if (!existing.students.some((st: any) => st.id === s.id)) {
                existing.students.push({
                  id: s.id,
                  name: s.fullName || s.name,
                  classGrade: s.classGrade,
                  section: s.section,
                });
              }
            } else {
              result.push({
                id: `guardian_${s.id}`,
                fullName: guardianName,
                email: guardianEmail || "—",
                phone: guardianPhone || "—",
                accountType: "Student Guardian Record",
                students: [{
                  id: s.id,
                  name: s.fullName || s.name,
                  classGrade: s.classGrade,
                  section: s.section,
                }],
              });
            }
          }
        }

        return createSuccessResponse(result);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();

        const parsed = RegisterParentSchema.safeParse(body);
        if (!parsed.success) {
          return createErrorResponse(400, "Validation failed", parsed.error.errors);
        }

        const { email, password, fullName, phone, studentIds } = parsed.data;

        let newUser;
        try {
          const result = await authService.createUser(email, password, { role: "parent" });
          newUser = { uid: result.uid };
          await authService.setCustomUserClaims(newUser.uid, { role: "parent", tenantId });
        } catch (err: any) {
          return createErrorResponse(400, err.message || "Failed to create auth user");
        }

        const service = new ParentsService();
        await service.createParent(
          { email, fullName, phone, studentIds },
          tenantId,
          user.uid
        );

        return createSuccessResponse({ uid: newUser.uid }, { message: "Parent created successfully" });
      }
    )
  )
);

