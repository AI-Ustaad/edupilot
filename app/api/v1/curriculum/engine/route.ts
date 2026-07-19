// app/api/v1/curriculum/engine/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withErrorHandler } from "@/route-helpers";
import { curriculumEngine, SchoolSelectionInput } from "@/services/curriculum-engine.service";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json() as SchoolSelectionInput;
  
  // Call the Intelligence Engine
  const generatedStructure = await curriculumEngine.generateAcademicStructure(body);
  
  return NextResponse.json({ success: true, data: generatedStructure });
});
