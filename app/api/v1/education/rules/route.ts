// app/api/v1/education/rules/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { educationRulesEngine } from "@/education/engines/education-rules.engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    let result: any;

    switch (action) {
      case "GET_COUNTRIES":
        result = educationRulesEngine.getCountries();
        break;
      case "GET_PROVINCES":
        result = educationRulesEngine.getProvinces(payload.countryId);
        break;
      case "GET_AUTHORITIES":
        result = educationRulesEngine.getAuthorities(payload.countryId, payload.ownershipType);
        break;
      case "GET_SYSTEMS":
        result = educationRulesEngine.getSystems(payload.authorityId);
        break;
      case "GET_VERSIONS":
        result = educationRulesEngine.getVersions(payload.systemId);
        break;
      case "GET_LEVELS":
        result = educationRulesEngine.getLevels(payload.versionId);
        break;
      case "GENERATE_STRUCTURE":
        result = educationRulesEngine.generateAcademicStructure(payload.versionId, payload.selectedLevelIds);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: "Rules Engine Failed" }, { status: 500 });
  }
}
