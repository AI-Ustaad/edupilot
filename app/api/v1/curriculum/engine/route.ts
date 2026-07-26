// app/api/v1/curriculum/engine/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth } from "@/route-helpers";
import { curriculumEngine, SchoolSelectionInput } from "@/services/curriculum-engine.service";

export const POST = withErrorHandler(
  withAuth(async (req: Request) => {
    const body = await req.json() as SchoolSelectionInput;

    const generatedStructure = await curriculumEngine.generateAcademicStructure(body);

    return NextResponse.json({ success: true, data: generatedStructure });
  })
);
