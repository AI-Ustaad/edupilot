// lib/data/master-catalog.data.ts
import { CountryEducationSystem } from "@/types/curriculum";

export const MASTER_CATALOG: CountryEducationSystem[] = [
  {
    id: "pak",
    name: "Pakistan",
    code: "PK",
    systems: [
      {
        id: "pctb_snc",
        name: "Punjab Curriculum & Textbook Board (PCTB / SNC)",
        type: "National",
        countryId: "pak",
        authorities: [
          {
            id: "punjab_gov",
            name: "Government of Punjab",
            systemId: "pctb_snc",
            curriculumVersions: [
              {
                id: "snc_2024",
                name: "Single National Curriculum 2024",
                year: "2024",
                levels: [
                  {
                    id: "primary",
                    name: "Primary",
                    grades: [
                      {
                        id: "grade_1",
                        name: "Grade 1",
                        order: 1,
                        ageRule: "5-6 years",
                        subjectGroups: [
                          { type: "Core", subjects: [
                            { id: "eng_g1", name: "English", code: "ENG", defaultPeriods: 6 },
                            { id: "urd_g1", name: "Urdu", code: "URD", defaultPeriods: 6 },
                            { id: "math_g1", name: "Mathematics", code: "MTH", defaultPeriods: 6 },
                            { id: "gk_g1", name: "General Knowledge", code: "GK", defaultPeriods: 3 },
                            { id: "isl_g1", name: "Islamiyat", code: "ISL", defaultPeriods: 3 },
                            { id: "nazra_g1", name: "Nazra Quran", code: "NZR", defaultPeriods: 3 }
                          ]}
                        ]
                      },
                      {
                        id: "grade_5",
                        name: "Grade 5",
                        order: 5,
                        ageRule: "9-10 years",
                        subjectGroups: [
                          { type: "Core", subjects: [
                            { id: "eng_g5", name: "English", code: "ENG", defaultPeriods: 6 },
                            { id: "urd_g5", name: "Urdu", code: "URD", defaultPeriods: 6 },
                            { id: "math_g5", name: "Mathematics", code: "MTH", defaultPeriods: 6 },
                            { id: "sci_g5", name: "Science", code: "SCI", defaultPeriods: 5, requiresLab: true },
                            { id: "ss_g5", name: "Social Studies", code: "SST", defaultPeriods: 4 },
                            { id: "isl_g5", name: "Islamiyat", code: "ISL", defaultPeriods: 3 },
                            { id: "quran_g5", name: "Quran", code: "QRN", defaultPeriods: 3 }
                          ]},
                          { type: "Elective", subjects: [
                            { id: "comp_g5", name: "Computer Science", code: "CMP", defaultPeriods: 2, requiresLab: true },
                            { id: "art_g5", name: "Art", code: "ART", defaultPeriods: 2 }
                          ]}
                        ]
                      }
                    ]
                  },
                  {
                    id: "secondary",
                    name: "Secondary",
                    grades: [
                      {
                        id: "grade_9",
                        name: "Grade 9",
                        order: 9,
                        ageRule: "13-14 years",
                        subjectGroups: [
                          { type: "Core", subjects: [
                            { id: "eng_g9", name: "English", code: "ENG", defaultPeriods: 6 },
                            { id: "urd_g9", name: "Urdu", code: "URD", defaultPeriods: 6 },
                            { id: "math_g9", name: "Mathematics", code: "MTH", defaultPeriods: 6 },
                            { id: "phy_g9", name: "Physics", code: "PHY", defaultPeriods: 4, requiresLab: true },
                            { id: "chem_g9", name: "Chemistry", code: "CHM", defaultPeriods: 4, requiresLab: true },
                            { id: "bio_g9", name: "Biology", code: "BIO", defaultPeriods: 4, requiresLab: true },
                            { id: "pak_st_g9", name: "Pakistan Studies", code: "PKS", defaultPeriods: 3 },
                            { id: "isl_g9", name: "Islamiyat", code: "ISL", defaultPeriods: 3 }
                          ]}
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "cambridge",
        name: "Cambridge Assessment International Education",
        type: "International",
        countryId: "pak",
        authorities: [
          {
            id: "caie_global",
            name: "Cambridge Global",
            systemId: "cambridge",
            curriculumVersions: [
              {
                id: "cam_2023",
                name: "Cambridge International 2023",
                year: "2023",
                levels: [
                  {
                    id: "igcse",
                    name: "IGCSE",
                    grades: [
                      {
                        id: "year_10",
                        name: "Year 10",
                        order: 10,
                        subjectGroups: [
                          { type: "Core", subjects: [
                            { id: "eng_y10", name: "English Language", code: "ENG", defaultPeriods: 5 },
                            { id: "math_y10", name: "Mathematics", code: "MTH", defaultPeriods: 5 },
                            { id: "bio_y10", name: "Biology", code: "BIO", defaultPeriods: 4, requiresLab: true },
                            { id: "chem_y10", name: "Chemistry", code: "CHM", defaultPeriods: 4, requiresLab: true },
                            { id: "phy_y10", name: "Physics", code: "PHY", defaultPeriods: 4, requiresLab: true },
                            { id: "ict_y10", name: "ICT", code: "ICT", defaultPeriods: 3, requiresLab: true }
                          ]},
                          { type: "Elective", subjects: [
                            { id: "bus_y10", name: "Business Studies", code: "BUS", defaultPeriods: 4 },
                            { id: "econ_y10", name: "Economics", code: "ECO", defaultPeriods: 4 }
                          ]}
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
