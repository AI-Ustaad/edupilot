// lib/ai/context-builder.ts
import { MasterSchoolConfiguration } from "@/types/configuration";

export function buildAiContext(config: MasterSchoolConfiguration | null): string {
  if (!config) {
    return "No school configuration available.";
  }

  const { school, academic } = config;
  
  // 1. Basic School Info
  const schoolInfo = `School Name: ${school.name} | Type: ${school.type} | Country: ${school.country} | Board: ${school.boardName} (${school.curriculumId})`;

  // 2. Academic Levels
  const levels = academic.levels.join(", ");

  // 3. Classes & Subjects Summary
  const classesSummary = academic.classes.map(c => {
    const subs = c.subjects.join(", ");
    return `${c.name} (Level: ${c.level}, Subjects: ${subs})`;
  }).join(" | ");

  // 4. Labs & Departments
  const labs = academic.requiredLabs.length > 0 ? academic.requiredLabs.join(", ") : "None";
  
  // 5. Final AI Context String
  const context = `
    [EDUPILOT SCHOOL CONTEXT]
    ${schoolInfo}
    Academic Levels Offered: ${levels}
    Classes & Subjects Mapping: ${classesSummary}
    Available Laboratories: ${labs}
    
    INSTRUCTIONS FOR AI:
    You must strictly follow the curriculum and subjects defined above. 
    Do not suggest subjects or topics that are not part of the official scheme of study for this school.
    If a subject requires a lab, ensure practical components are included in lesson plans.
  `;

  return context.trim();
}
