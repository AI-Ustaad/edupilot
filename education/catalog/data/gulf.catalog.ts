// education/catalog/data/gulf.catalog.ts
import { Country, Subject } from "../types.catalog";

export const GULF_SUBJECTS: Subject[] = [
  { id: "arabic", name: "Arabic Language", code: "ARA", department: "Languages", requiresLab: false },
  { id: "isl_studies", name: "Islamic Studies", code: "ISL", department: "Religious", requiresLab: false },
  { id: "moral_ed", name: "Moral Education", code: "ME", department: "Humanities", requiresLab: false },
  { id: "social_studies", name: "Social Studies", code: "SST", department: "Humanities", requiresLab: false },
  { id: "ms_math", name: "Mathematics", code: "MTH", department: "Sciences", requiresLab: false },
  { id: "ms_sci", name: "Science", code: "SCI", department: "Sciences", requiresLab: true },
];

export const UAE_CATALOG: Country = {
  id: "ae",
  name: "United Arab Emirates",
  code: "AE",
  Provinces: [
    { id: "dubai", name: "Dubai", countryId: "ae" },
    { id: "abu_dhabi", name: "Abu Dhabi", countryId: "ae" },
  ],
  // @ts-ignore
  authorities: [
    // 1. UAE Ministry of Education
    {
      id: "uae_moe",
      name: "UAE Ministry of Education (MOE)",
      countryId: "ae",
      ownershipType: "Public",
      institutionType: "School", // 🚀 NEW
      systems: [
        {
          id: "moe_uae",
          name: "UAE National Curriculum",
          type: "National",
          versions: [
            {
              id: "moe_2024",
              name: "MOE 2024",
              year: "2024",
              levels: [
                { id: "primary", name: "Primary", grades: [
                  { id: "uae_g1", name: "Grade 1", order: 1, schemeOfStudy: { subjects: [{ subjectId: "arabic", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "ms_math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "isl_studies", category: "Compulsory", defaultPeriods: 3 }, { subjectId: "moral_ed", category: "Compulsory", defaultPeriods: 2 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    },
    // 2. Cambridge International (UAE)
    {
      id: "cambridge_uae",
      name: "Cambridge International (UAE)",
      countryId: "ae",
      ownershipType: "Private",
      institutionType: "School", // 🚀 NEW
      systems: [
        {
          id: "cambridge_uae_sys",
          name: "British Curriculum (Cambridge)",
          type: "International",
          versions: [
            {
              id: "cam_uae_2023",
              name: "Cambridge 2023",
              year: "2023",
              levels: [
                { id: "igcse", name: "IGCSE", grades: [
                  { id: "uae_y10", name: "Year 10", order: 10, schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Core", defaultPeriods: 5 }, { subjectId: "ms_math", category: "Core", defaultPeriods: 5 }, { subjectId: "ms_sci", category: "Core", defaultPeriods: 5 }, { subjectId: "arabic", category: "Compulsory", defaultPeriods: 4 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    }
  ]
};
