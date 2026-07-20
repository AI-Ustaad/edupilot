// education/catalog/data/pakistan.catalog.ts
import { Country, Subject } from "../types.catalog";

export const PAKISTAN_SUBJECTS: Subject[] = [
  { id: "eng", name: "English", code: "ENG", department: "Languages", requiresLab: false },
  { id: "urd", name: "Urdu", code: "URD", department: "Languages", requiresLab: false },
  { id: "math", name: "Mathematics", code: "MTH", department: "Sciences", requiresLab: false },
  { id: "sci", name: "General Science", code: "SCI", department: "Sciences", requiresLab: true },
  { id: "phy", name: "Physics", code: "PHY", department: "Sciences", requiresLab: true },
  { id: "chem", name: "Chemistry", code: "CHM", department: "Sciences", requiresLab: true },
  { id: "bio", name: "Biology", code: "BIO", department: "Sciences", requiresLab: true },
  { id: "cs", name: "Computer Science", code: "CS", department: "Computer Science", requiresLab: true },
  { id: "isl", name: "Islamiyat", code: "ISL", department: "Religious", requiresLab: false },
  { id: "pst", name: "Pakistan Studies", code: "PST", department: "Humanities", requiresLab: false },
  { id: "ss", name: "Social Studies", code: "SST", department: "Humanities", requiresLab: false },
  { id: "quran", name: "Nazra Quran", code: "QUR", department: "Religious", requiresLab: false },
];

export const PAKISTAN_CATALOG: Country = {
  id: "pk",
  name: "Pakistan",
  code: "PK",
  Provinces: [
    { id: "punjab", name: "Punjab", countryId: "pk" },
    { id: "sindh", name: "Sindh", countryId: "pk" },
    { id: "kpk", name: "Khyber Pakhtunkhwa", countryId: "pk" },
    { id: "balochistan", name: "Balochistan", countryId: "pk" },
  ],
  // @ts-ignore
  authorities: [
    // 1. Punjab Government
    {
      id: "punjab_gov",
      name: "Punjab Government (PCTB)",
      countryId: "pk",
      provinceId: "punjab",
      ownershipType: "Public",
      systems: [
        {
          id: "pctb_snc",
          name: "Single National Curriculum (SNC)",
          type: "National",
          versions: [
            {
              id: "snc_2024",
              name: "SNC 2024",
              year: "2024",
              levels: [
                { id: "primary", name: "Primary", grades: [
                  { id: "grade_1", name: "Grade 1", order: 1, schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } },
                  { id: "grade_5", name: "Grade 5", order: 5, schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "sci", category: "Compulsory", defaultPeriods: 5 }, { subjectId: "pst", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } }
                ]},
                { id: "secondary", name: "Secondary", grades: [
                  { id: "grade_9", name: "Grade 9", order: 9, schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "phy", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "chem", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "bio", category: "Elective", defaultPeriods: 4 }, { subjectId: "cs", category: "Elective", defaultPeriods: 4 }, { subjectId: "pst", category: "Compulsory", defaultPeriods: 3 }, { subjectId: "isl", category: "Compulsory", defaultPeriods: 3 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    },
    // 2. Federal Government (FBISE)
    {
      id: "federal_gov",
      name: "Federal Board (FBISE)",
      countryId: "pk",
      ownershipType: "Public",
      systems: [
        {
          id: "fbise",
          name: "Federal Board of Intermediate and Secondary Education",
          type: "National",
          versions: [
            {
              id: "fbise_2024",
              name: "FBISE 2024",
              year: "2024",
              levels: [
                { id: "primary", name: "Primary", grades: [
                  { id: "fed_g1", name: "Class 1", order: 1, schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }] } }
                ]},
                { id: "secondary", name: "Secondary", grades: [
                  { id: "fed_g9", name: "Class 9", order: 9, schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "urd", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "math", category: "Compulsory", defaultPeriods: 6 }, { subjectId: "phy", category: "Compulsory", defaultPeriods: 4 }, { subjectId: "chem", category: "Compulsory", defaultPeriods: 4 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    },
    // 3. Cambridge International (Pakistan)
    {
      id: "cambridge_pk",
      name: "Cambridge International (Pakistan)",
      countryId: "pk",
      ownershipType: "Private",
      systems: [
        {
          id: "cambridge_cie",
          name: "Cambridge Assessment International Education",
          type: "International",
          versions: [
            {
              id: "cam_2023",
              name: "Cambridge 2023",
              year: "2023",
              levels: [
                { id: "igcse", name: "IGCSE", grades: [
                  { id: "year_10", name: "Year 10", order: 10, schemeOfStudy: { subjects: [{ subjectId: "eng", category: "Core", defaultPeriods: 5 }, { subjectId: "math", category: "Core", defaultPeriods: 5 }, { subjectId: "phy", category: "Core", defaultPeriods: 4 }, { subjectId: "chem", category: "Core", defaultPeriods: 4 }, { subjectId: "bio", category: "Core", defaultPeriods: 4 }, { subjectId: "cs", category: "Core", defaultPeriods: 3 }] } }
                ]}
              ]
            }
          ]
        }
      ]
    }
  ]
};
